/*
 * Copyright Callum Tolley and Michael Peran Truscott
 */
const GRAPH_API_URL = 'api/graph';
const TWITTER_PIC_API_URL = 'api/twitter_pic';
const WIRE_SPHERE_URL = 'js/models/Sphere.json';
const GRAPH_API_TIMEOUT = 5000;

const TRANSPARENT_SRC = 'data:image/gif;base64,R0lGODlhAQABAPcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAABAAEAAAgEAP8FBAA7';

const LOGO_SCALE = 0.004;

var debugMeta = document.querySelector('meta[name="debug"]');
const DEBUG = debugMeta == null ? false : debugMeta.getAttribute('content') == true;

var logo_view = false;
var autoMode = false;
var displayNode = null;
var shouldTick = true;

function toRadians(deg) {
    return deg * (Math.PI/180);
}

var exports = {};

window.addEventListener('load', function() {
    exports.focusOnInterest = focusOnInterest;
    exports.toggleLogoView = toggleLogoView;
    exports.toggleAutoMode = toggleAutoMode;
    exports.minimizeHelp = minimizeHelp;
    exports.maximizeHelp = maximizeHelp;
    exports.searchSelect = searchSelect;
    
    const STATIC_BASE_URL = document.querySelector('meta[name="static"]').getAttribute('content');
    // Setup scene + renderer
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    //directional light
    var light = new THREE.SpotLight(0xffffff, 1, 100);
    light.position.set(0, 10, 10);
    light.castShadow = false;
    scene.add(light);

    scene.fog = new THREE.Fog(0xffffff, 4, 20);

    // Add wire frame to scene
    new THREE.JSONLoader().load(
        STATIC_BASE_URL + WIRE_SPHERE_URL,
        function (geometry) {
            var material = new THREE.MeshBasicMaterial({
                color: 0xd3d3d3,
                opacity: 0.3,
                transparent: true,
                wireframe: true,
                wireframeLinewidth: 2,
                fog: false
            });

            var object = new THREE.Mesh(geometry, material);
            object.scale.set(100, 100, 100);

            scene.add(object);
        }
    );

    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // postprocessing
    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    var glitchPass = new THREE.GlitchPass();
    glitchPass.renderToScreen = true;
    composer.addPass(glitchPass);

    // Setup mouse
    var mouse = new THREE.Vector2();

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    window.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('click', onMouseClick, false);
    window.addEventListener('wheel', onMouseScroll, false);
    renderer.domElement.addEventListener("touchstart", handleTouchStart, false);
    renderer.domElement.addEventListener("touchend", handleTouchEnd, false);
    renderer.domElement.addEventListener("touchcancel", handleTouchCancel, false);
    renderer.domElement.addEventListener("touchmove", handleTouchMove, false);
    // Setup resize callback
    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resize);

    // Setup raycaster
    var raycaster = new THREE.Raycaster();

    // Setup controls
    camera.position.z = 7;
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.minDistance = 0.5;
    controls.maxDistance = 10;

    controls.minPolarAngle = toRadians(45);
    controls.maxPolarAngle = toRadians(135);

    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    controls.enableZoom = true;
    controls.zoomSpeed = 2;

    controls.enableRotate = true;
    controls.rotateSpeed = 0.4;

    controls.enablePan = false;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;

    // Camera targets
    var target = new THREE.Vector3();
    var targetDistance = 10;
    var targetPhi = null;
    var targetTheta = null;

    // Temp
    var tempVector1 = new THREE.Vector3();
    var tempVector2 = new THREE.Vector3();
    var tempVector3 = new THREE.Vector3();
    var tempSpherical1 = new THREE.Spherical();

    // Temp
    var prevDebugInfoHTML = null;
    var prevFocusedInfoHTML = null;

    // Setup selected node
    // The difference between the selectedNode and the attachedNode is that the attachedNode
    // is almost never null. This allows the info to follow the node even if the node isn't
    // selected.
    var selectedNode = null;
    var attachedNode = null;

    // The currently focused node
    var focusedNode = null;
    var focusedAttachedNode = null;

    // Create focused node info container
    var focusedNodeInfoContainer = document.createElement('div');
    focusedNodeInfoContainer.className = 'bubble-container';
    var focusedNodeInfo = document.createElement('div');
    focusedNodeInfo.className = 'unselectable bubble left';
    focusedNodeInfo.innerHTML = '';
    focusedNodeInfoContainer.appendChild(focusedNodeInfo);
    document.getElementById('container').appendChild(focusedNodeInfoContainer);
    focusedNodeInfoContainer.addEventListener('transitionend', function() {
        // Opacity transition has ended
        if (focusedNodeInfoContainer.style.opacity == 0) {
            focusedAttachedNode = null;
        }
    }, true);
    unfocus();
    
    var selectedNodeInfo = document.createElement('div');
    document.getElementById('container').appendChild(selectedNodeInfo);
    selectedNodeInfo.className = 'unselectable info';
    selectedNodeInfo.addEventListener('transitionend', function() {
        // Opacity transition has ended
        if (selectedNodeInfo.style.opacity == 0) {
            attachedNode = null;
        }
    }, true);
    deselect();
    
    // Create help info box
    var helpBox = document.getElementById('help');
    var helpMinimizeButton = document.getElementById('help-minimize-button');
    var helpMaximizeButton = document.getElementById('help-maximize-button');
    var helpBoxInner = document.getElementById('help-inner');
    minimizeHelp();
    
    // Create search bar
    var search = document.getElementById('search');
    var searchBar = document.querySelector('#search > input[type="text"]');
    searchBar.addEventListener('input', function(e) {
        // Input occured, regen results
        updateSearch();
    });
    var searchResultsDisplay = document.getElementById('search-results');
    
    // Setup graph
    var graph = new Graph(scene);
    updateGraph();
    
    // Deal with display mode
    var focusCounter = 0;
    var autoUpdateFunc = function () {
        if (!autoMode) return;

        if (focusedNode !== null) { // We had a previous node, so unfocus it!
            unfocus();
            setTimeout(autoUpdateFunc, 5000);
            return;
        }

        if (logo_view) {
            // leave logo_view
            disableLogoView();
            setTimeout(autoUpdateFunc, 5000);
            return;
        }

        if (focusCounter < 2) {
            focusCounter++;
            var rand = Math.floor(Math.random() * graph.nodes.length);
            displayNode = graph.nodes[rand]; // Select a new node
            focus(displayNode);
            setTimeout(autoUpdateFunc, 5000);
        }
        else {
            focusCounter -= 2;
            //enter logo view
            enableLogoView();
            setTimeout(autoUpdateFunc, 10000);
        }
    };

    var prevTime = NaN;

    var sprites = generateTextSprites(scene);

    // instantiate a loader
    var loader = new THREE.ImageLoader();

    //start setting up stuff for logo_view
    var logo_texture = null;
    var logo_image = null;
    var logo_data = null;

    new THREE.TextureLoader().load(
        STATIC_BASE_URL + 'images/logo.png',
        function (texture) {
            logo_texture = texture;
            logo_image = logo_texture.image;
            console.log("logo: "+logo_image.width);
            logo_data = getImageData(logo_image);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (xhr) {
            // TODO
            console.log('An error occurred.');
        }
    );

    var background_image = null;
    var logo_background = null;

    new THREE.TextureLoader().load(
        STATIC_BASE_URL + 'images/logo_orange.png',
        function (texture) {
            background_image = texture;
            var geometry = new THREE.PlaneGeometry(background_image.image.width * LOGO_SCALE, background_image.image.height * LOGO_SCALE);
            var material = new THREE.MeshPhongMaterial({
                map: background_image,
                transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.01,
                opacity: 0
            });
            logo_background = new THREE.Mesh(geometry, material);
            logo_background.position.z = -0.2;
            scene.add(logo_background);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (xhr) {
            // TODO
            console.log('An error occurred.');
        }
    );

    var fade_image = null;
    var logo_fade = null;

    new THREE.TextureLoader().load(
        STATIC_BASE_URL + 'images/logo_fade.png',
        function(texture) {
            fade_image = texture;
            console.log("fade: "+fade_image.image.width);
            var geometry = new THREE.PlaneGeometry(fade_image.image.width*LOGO_SCALE, fade_image.image.height*LOGO_SCALE);
            var material = new THREE.MeshPhongMaterial({
                map: fade_image,
                transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.01,
                opacity: 0
            });
            logo_fade = new THREE.Mesh(geometry, material);
            logo_fade.position.z = -0.2;
            scene.add(logo_fade);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(xhr) {
            // TODO
            console.log('An error occurred.');
        }
    );

    function render() {
        requestAnimationFrame(render);

        // Calculate timings
        var now = Date.now().valueOf();
        if (isNaN(prevTime)) {
            prevTime = now;
        }
        var dt = (now - prevTime) / 1000.0;
        prevTime = now;
        dt = Math.min(dt, 0.3);

        update(dt);

        //renderer.render(scene, camera);
        composer.render();
    }

    render();

    function toggleLogoView() {
        if (logo_image !== null) {
            if (logo_view) {
                disableLogoView();
            }
            else {
                unfocus();
                enableLogoView();
            }
        }
    }

    /* Enable logo view */
    function enableLogoView() {
        if (logo_view) return;

        logo_view = true;
        document.getElementById("toggle_logo").checked = true;

        // disable manual camera movements
        controls.autoRotate = false;
        controls.enableRotate = false;
        controls.enableZoom = false;
        targetDistance = 10;
        targetPhi = Math.PI / 2;
        targetTheta = Math.PI;

        // disable simulation ticking
        shouldTick = false;

        // just changed to logo_view
        for (i = 0; i < graph.nodes.length; i++) {
            graph.nodes[i].shrink = true;

            // if the node doesn't have a target yet
            if (graph.nodes[i].tx == null) {
                //generates coords n times and chooses the one furthest away from the other coords.
                var furthestDist = 0;
                var furthestCoords = [0, 0, 0];
                for (var k = 0; k < 50; k++) {
                    var smallestDist = 5000;
                    var coords = generateLogoCoords();
                    for (var j = 0; j < i; j++) {
                        //checks the distance from every other node.
                        var thisDist = distTo(graph.nodes[j].tx, graph.nodes[j].ty, coords[0], coords[1]);
                        if (thisDist < smallestDist) {
                            smallestDist = thisDist;
                        }
                    }
                    if (smallestDist > furthestDist) {
                        furthestDist = smallestDist;
                        furthestCoords = coords;
                    }
                }
                // sets target for logo view
                graph.nodes[i].tx = furthestCoords[0];
                graph.nodes[i].ty = furthestCoords[1];
                graph.nodes[i].tz = furthestCoords[2];

                // sets the position when out of logo view
                graph.nodes[i].px = graph.nodes[i].x;
                graph.nodes[i].py = graph.nodes[i].y;
                graph.nodes[i].pz = graph.nodes[i].z;

            }
        }
        for (i = 0; i < graph.conns.length; i++) {
            graph.conns[i].sceneObj.material.opacity = 0;
        }
    }

    /* Disable logo view */
    function disableLogoView() {
        if (!logo_view)
            return;
        logo_view = false;
        document.getElementById("toggle_logo").checked = false;

        controls.autoRotate = true;
        controls.enableRotate = true;
        controls.enableZoom = true;
        targetDistance = null;
        targetPhi = null;
        targetTheta = null;

        //flicked back to normal view
        for (i = 0; i < graph.nodes.length; i++) {
            graph.nodes[i].sceneObj.material.color.setHex(graph.nodes[i].color);
            //stores the target in a temp variable
            graph.nodes[i].shrink = false;
        }
        for (i = 0; i < graph.conns.length; i++) {
            graph.conns[i].sceneObj.material.opacity = 1;
        }
    }

    function toggleAutoMode() {
        autoMode = !autoMode;
        if (autoMode) {
            document.getElementById('toggle_logo').disabled = true;
            setTimeout(autoUpdateFunc, 1000);
        } else {
            document.getElementById('toggle_logo').disabled = false;
        }
    }

    function generateLogoCoords() {
        if (logo_image !== null) {
            var r = 250;
            var g = 250;
            var b = 0;
            var x = 0;
            var y = 0;
            while (!(r > 250 && g > 250 && b > 250)) {
                x = Math.random() * logo_image.width;
                y = Math.random() * logo_image.height;
                var pixel_data = getPixel(logo_data, Math.floor(x), Math.floor(y));
                r = pixel_data.r;
                g = pixel_data.g;
                b = pixel_data.b;
                x -= logo_image.width / 2;
                y -= logo_image.height / 2;
            }
            return [x * LOGO_SCALE, -y * LOGO_SCALE, 0];
        }
    }

    function onMouseClick(event) {
        // Unfocus from search box
        searchBar.blur();
        
        // Update mouse coords
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update selected node first
        updateMouseSelectedNode();
        
        // Then process result
        if (selectedNode === focusedNode) {
            // If the user clicks on the currently focused node
            // unfocus
            unfocus();
        } else if (!logo_view) {
            focus(selectedNode);
        }
    }

    function onMouseScroll(event) {
        handlePotentialZoomEvent();
        event.preventDefault();
    }

    function handleTouchStart(event) {
        handlePotentialZoomEvent();
    }

    function handleTouchEnd(event) {
        handlePotentialZoomEvent();
    }

    function handleTouchCancel(event) {
        handlePotentialZoomEvent();
    }

    function handleTouchMove(event) {
        handlePotentialZoomEvent();
    }

    function handlePotentialZoomEvent() {
        // Potential zoom can't happen if zoom isn't enabled
        if (controls.enableZoom) {
            targetDistance = null;

            // Check if distance is > a certain amount, and if it is, unfocus from the event
            tempVector1.copy(camera.position).negate().add(controls.target);
            tempSpherical1.setFromVector3(tempVector1);
            var currentDistance = tempSpherical1.radius;

            if (currentDistance > 3.2) {
                unfocus();
                targetDistance = null;
            }
        }
    }

    function update(dt) {
        if (!shouldTick && !logo_view) {
            for (i = 0; i < graph.nodes.length; i++) {
                //if it doesn't match, break
                if (graph.nodes[i].x != graph.nodes[i].px ||
                    graph.nodes[i].y != graph.nodes[i].py ||
                    graph.nodes[i].z != graph.nodes[i].pz) {
                    break;
                }
                if (i == graph.nodes.length - 1) {
                    graph.simulation.alpha(0.2);
                    graph.simulation.restart();
                    graph.simulation.stop();
                    shouldTick = true;
                }
            }
        }

        //updates logo_view background
        if (logo_background != null) {
            if (logo_view && (logo_background.material.opacity < 1)) {
                if (logo_fade == null || !(logo_fade.material.opacity > 0)) {
                    logo_background.material.opacity += 2.0 * dt;
                }
                else {
                    //console.log(logo_fade.material.opacity);
                }
            }
            else if (!logo_view && (logo_background.material.opacity > 0)) {
                logo_background.material.opacity -= 2.0 * dt;
            }
        }

        if (logo_fade != null) {
            if (logo_view && (logo_fade.material.opacity < 1)) {
                var fadeIn = true;
                for (i = 0; i < graph.nodes.length; i++) {
                    //if it isn't in the right place
                    if (graph.nodes[i].x != graph.nodes[i].tx ||
                        graph.nodes[i].y != graph.nodes[i].ty ||
                        graph.nodes[i].z != graph.nodes[i].tz) {
                        fadeIn = false;
                        break;
                    }
                }
                if (fadeIn) {
                    logo_fade.material.opacity += 0.8 * dt;
                    logo_background.material.opacity -= 0.8 * dt;
                }

            }
            else if (!logo_view && (logo_fade.material.opacity > 0)) {
                logo_fade.material.opacity -= 2.0 * dt;
            }
        }

        const THRESH = 0.01;

        // Update target pos
        controls.update();
        controls.target.lerp(target, 2.5 * dt);

        // Update distance
        tempVector2.copy(controls.target).negate();
        tempVector1.copy(camera.position).add(tempVector2);
        tempSpherical1.setFromVector3(tempVector1);
        var currentDistance = tempSpherical1.radius;

        if (targetDistance !== null) {
            var difference = targetDistance - currentDistance;
            if (difference < THRESH) {
                controls.dollyOut(1.0 + difference * 0.4 * dt);
            } else if (difference > THRESH) {
                controls.dollyIn(1.0 - difference * 0.7 * dt);
            } else {
                // Do nothing
            }
        }

        // Go to specified phi & theta
        tempVector2.copy(controls.target).negate();
        tempVector1.copy(camera.position).add(tempVector2);
        tempSpherical1.setFromVector3(tempVector1);
        var currentPhi = tempSpherical1.phi;
        var currentTheta = tempSpherical1.theta;
        if (targetPhi !== null) {
            var diff = targetPhi - currentPhi;
            // Normalize to be in range [0, 2*pi)
            diff %= 2 * Math.PI;
            if (diff < 0)
                diff += 2 * Math.PI;
            // Now modify so that range is [-pi, pi)
            diff -= Math.PI;
            if (Math.abs(diff) > THRESH) {
                //tempSpherical1.phi += diff * 2.0 * dt;
            }
        }
        if (targetTheta !== null) {
            var diff = targetTheta - currentTheta;
            // Normalize to be in range [0, 2*pi)
            diff %= 2 * Math.PI;
            if (diff < 0)
                diff += 2 * Math.PI;
            // Now modify so that range is [-pi, pi)
            diff -= Math.PI;
            if (Math.abs(diff) > THRESH) {
                tempSpherical1.theta += diff * 2.0 * dt;
            }
        }
        if (targetTheta !== null || targetPhi !== null) {
            camera.position.setFromSpherical(tempSpherical1).add(controls.target);
        }

        graph.update(dt, shouldTick);

        // Calculate intersection of mouse
        updateMouseSelectedNode();
        updateSelected();
        updateFocus();

        updateDebugInfo();

        // Update sprites
        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            var move = false;
            if (logo_view && sprite.position.z > 0) {
                //stops sprites appearing in front of the logo
                move = true;
            }
            //will stop sprites being too close to the node
            else if (focusedNode !== null) {
                var threshold = targetDistance * 4;
                if (withInTheshold(sprite.position.x, focusedNode.x, threshold) &&
                    withInTheshold(sprite.position.y, focusedNode.y, threshold) &&
                    withInTheshold(sprite.position.z, focusedNode.z, threshold)) {
                    move = true;
                }
            }

            if (move) {
                sprite.userData.opacityToggle = false;
                sprite.material.opacity -= sprite.userData.opacitySpeed;
            }
            if (sprite.userData.opacityToggle) {
                sprite.material.opacity += sprite.userData.opacitySpeed;
            }
            else {
                sprite.material.opacity -= sprite.userData.opacitySpeed;
            }
            if (sprite.material.opacity > 0.6 || sprite.material.opacity < 0) {
                sprite.userData.opacityToggle = !sprite.userData.opacityToggle;
                if (sprite.material.opacity < 0) {
                    if (focusedNode !== null) {
                        move = true;
                        while (move) {
                            var p = generateSpriteCoords();
                            sprite.position.set(p.x, p.y, p.z);
                            threshold = targetDistance * 4;
                            if (!(withInTheshold(sprite.position.x, focusedNode.x, threshold) &&
                                withInTheshold(sprite.position.y, focusedNode.y, threshold) &&
                                withInTheshold(sprite.position.z, focusedNode.z, threshold))) {
                                move = false;
                            }
                        }
                    }
                    else {
                        p = generateSpriteCoords();
                        sprite.position.set(p.x, p.y, p.z);
                    }
                }
            }
        }
    }
    
    // Using the mouse coords, select the node that is under the mouse.
    function updateMouseSelectedNode() {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        intersects = intersects.filter(function (val, i, arr) {
            return val.object.userData && val.object.userData.isNode;
        });
        select(intersects.length > 0 ? intersects[0].object.userData.node : null);
    }
    
    // Clear the search bar + search results
    function clearSearch() {
        searchBar.value = '';
        updateSearch();
    }
    
    // Update the search results
    function updateSearch() {
        var searchResults = [];
        var searchTerm = searchBar.value;
        if (searchTerm.length > 0) {
            searchResults = graph.search(searchTerm);
        }
        setSearchResults(searchResults);
    }
    
    // Sets the current search results to the list given
    function setSearchResults(results) {
        console.log(results.length + ' search result(s)');
        var html = '';
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var node = result.node;
            html += '<li class="unselectable" onclick="exports.searchSelect(' + node.id + ',' + escapeHTML('"' + node.type + '"') + ')">' + result.html + '</li>';
        }
        searchResultsDisplay.innerHTML = html;
    }
    
    // Called when the user selects a search result. Called with the node index.
    function searchSelect(id, type) {
        for (var i = 0; i < graph.nodes.length; i++) {
            var node = graph.nodes[i];
            if (node.id === id && node.type === type) {
                // Select this node
                focus(node);
                // Clear search box
                clearSearch();
                break;
            }
        }
    }

    function updateGraph() {
        // Don't update during logo view
        if (logo_view) {
            setTimeout(updateGraph, GRAPH_API_TIMEOUT);
            return;
        }

        // Download graph using AJAX
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState === XMLHttpRequest.DONE) {
                setTimeout(updateGraph, GRAPH_API_TIMEOUT);
                if (req.status === 200) {
                    // Don't update during logo view
                    if (logo_view)
                        return;

                    graph.processResponse(req.responseText);
                } else {
                    // Error - TODO
                    console.error("Error downloading graph")
                }
            }
        };
        req.open("GET", GRAPH_API_URL, true);
        req.send();
    }

    function glitch() {
        // Start glitch
        glitchPass.glitchMode = 1;
        setTimeout(function () {
            // Turn glitch mode into mega mode
            glitchPass.glitchMode = 2;
            setTimeout(function () {
                // Turn glitch mode off
                glitchPass.glitchMode = 0;
            }, 20 + Math.random() * 40)
        }, 100 + Math.random() * 100);
    }

    // Unfocus from the current node
    function unfocus() {
        if (focusedNode === null)
            return;

        glitch();
        focusedNode = null;
        focusedNodeInfoContainer.style.opacity = 0;

        targetDistance = 8;
        target.set(0, 0, 0);
    }

    // Given the id of an interest, focus on it
    function focusOnInterest(interestId) {
        // Find the interest
        focus(graph.findInterest(interestId));
    }

    // Focus to specified node. null means unfocus
    function focus(node) {
        if (node === null) {
            unfocus();
            return;
        }
        glitch();
        focusedNodeInfoContainer.style.opacity = 100;
        focusedNode = node;
        focusedAttachedNode = node;

        // Set camera
        targetDistance = 1;

        // Set twitter pic URL
        updateTwitterPicUrl();
    }
    
    function updateTwitterPicUrl() {
        if (focusedAttachedNode.twitter) {
            if (focusedAttachedNode.twitterPicUrl) {
                return;
            } else {
                var node = focusedAttachedNode;

                // Download twitter pic URL using AJAX
                var req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (req.readyState === XMLHttpRequest.DONE) {
                        if (req.status === 200) {
                            // Get URL
                            node.twitterPicUrl = req.responseText;
                        } else {
                            // Error
                            console.error("Error downloading URL for twitter pic");
                            //node.twitterPicUrl = '/static/linc/images/logo_orange.png'; // Testing
                        }
                    }
                };
                req.open("GET", TWITTER_PIC_API_URL + '?id=' + encodeURI(focusedAttachedNode.id), true);
                req.send();
            }
        }
    }

    // Update the box attached to the focused node
    function updateFocus() {
        if (focusedNode !== null) {
            target.copy(focusedNode.sceneObj.position);
        }

        if (focusedAttachedNode === null) {
            focusedNodeInfoContainer.style.display = 'none'
            return;
        } else if (focusedNodeInfoContainer.style.display === 'none') {
            focusedNodeInfoContainer.style.display = ''
        }
        
        // Calculate position of box on screen
        tempVector2.crossVectors(camera.up, camera.getWorldDirection(tempVector2))
            .multiplyScalar(-0.12); // Calculate left vector
        tempVector1.copy(focusedAttachedNode.sceneObj.position)
            .add(tempVector2); // Add left vector
        tempVector2.cross(camera.getWorldDirection(tempVector3))
            .multiplyScalar(0.2); // Calculate down vector
        tempVector1.add(tempVector2) // Add up vector
            .project(camera); // Project onto screen

        var w = window.innerWidth;
        var h = window.innerHeight;
        var w2 = w / 2;
        var h2 = h / 2;

        var x = tempVector1.x * w2 + w2;
        var y = tempVector1.y * -h2 + h2 - 26; // -26 makes the arrow be the centre of scaling, rather than the top left
        focusedNodeInfoContainer.style.left = x + 'px';
        focusedNodeInfoContainer.style.top = y + 'px';
        
        var newHTML = '';
        
        if (focusedAttachedNode instanceof Person) {
            if (focusedNodeInfoContainer.className !== 'bubble-container person')
                focusedNodeInfoContainer.className = 'bubble-container person';

            // Escape text
            var name = escapeHTML(focusedAttachedNode.name);
            var twitter = escapeHTML(focusedAttachedNode.twitter);
            var is = focusedAttachedNode.interests.map(function (interest) {
                return escapeHTML(interest.name);
            });
            
            // Create info
            if (!focusedAttachedNode.twitterPicUrl) {
                newHTML += '<img id="twitter-pic" src="' + TRANSPARENT_SRC + '" width="0" height="0">';
            } else {
                newHTML += '<img id="twitter-pic" src="' + escapeHTML(focusedAttachedNode.twitterPicUrl) + '" width="100px" height="100px">';
            }
            newHTML += '<h1>' + name + '</h1>';
            
            if (typeof focusedAttachedNode.twitter === 'string') {
                newHTML += '<div>';
                newHTML += '  <i class="fa fa-twitter"></i>';
                newHTML += '  <a target="_blank" class="twitter" href="//twitter.com/@' + twitter + '">@' + twitter + '</a>';
                newHTML += '</div>';
            }

            newHTML += '<ul>';
            for (var i = 0; i < is.length; i++) {
                newHTML += '<li><a href="javascript:exports.focusOnInterest(' + focusedAttachedNode.interests[i].id + ')">' + is[i] + '</a></li>'
            }
            newHTML += '</ul>';
            
        } else if (focusedAttachedNode instanceof Interest) {
            if (focusedNodeInfoContainer.className !== 'bubble-container interest')
                focusedNodeInfoContainer.className = 'bubble-container interest';

            var interestNum = focusedAttachedNode.numInterested;
            var interestNumStr;
            if (interestNum == 1) {
                interestNumStr = interestNum + ' person is interested in this.';
            } else {
                interestNumStr = interestNum + ' people are interested in this.';
            }
            
            newHTML += '<h1>' + focusedAttachedNode.name.toUpperCase() + '</h1>';
            newHTML += '<i>' + focusedAttachedNode.desc + '</i> <br><br>';
            newHTML += interestNumStr + '<br>';
        }
        
        if (prevFocusedInfoHTML !== newHTML) {
            focusedNodeInfo.innerHTML = newHTML;
            prevFocusedInfoHTML = newHTML;
        }
    }

    function deselect() {
        selectedNode = null;
        selectedNodeInfo.style.opacity = 0;
    }

    function select(obj) {
        if (obj === null) {
            deselect();
            return;
        }

        // Set div's content
        selectedNodeInfo.textContent = obj.name;
        selectedNodeInfo.style.opacity = 100;
        selectedNode = obj;
        attachedNode = obj;

        if (selectedNode instanceof Interest) {
            selectedNodeInfo.textContent = selectedNodeInfo.textContent.toUpperCase();
        }
    }
    
    function minimizeHelp() {
        helpBox.className = 'help-minimized';
    }
    
    function maximizeHelp() {
        helpBox.className = 'help-maximized';
    }

    function updateDebugInfo() {
        var element = document.getElementById('debuginfo');
        if (!DEBUG) {
            if (element.style.display !== 'none')
                element.style.display = 'none';
            return;
        }
        element.style.opacity = 100;
        var s = '';
        s += 'selectedNode: ' + (selectedNode == null ? null : selectedNode.name) + '<br />';
        s += 'attachedNode: ' + (attachedNode == null ? null : attachedNode.name) + '<br />';
        s += 'focusedNode: '  + (focusedNode  == null ? null : focusedNode.name) + '<br />';
        s += 'focusedAttachedNode: '  + (!focusedAttachedNode  ? null : focusedAttachedNode.name) + '<br />';
        
        // Camera stuff
        tempVector1.copy(camera.position).negate().add(controls.target);
        tempSpherical1.setFromVector3(tempVector1);
        var currentDistance = tempSpherical1.radius;
        var currentPhi = tempSpherical1.phi;
        var currentTheta = tempSpherical1.theta;
        s += '<hr />';
        s += 'currentDistance: '  + currentDistance.toFixed(2) + '<br />';
        s += 'currentPhi: '  + currentPhi.toFixed(2) + '<br />';
        s += 'currentTheta: '  + currentTheta.toFixed(2) + '<br />';
        s += '<hr />';
        s += 'targetDistance: '  + (targetDistance == null ? null : targetDistance.toFixed(2)) + '<br />';
        s += 'targetPhi: '       + (targetPhi      == null ? null : targetPhi.toFixed(2)) + '<br />';
        s += 'targetTheta: '     + (targetTheta    == null ? null : targetTheta.toFixed(2)) + '<br />';
        s += '<hr />';
        
        // View modes
        s += 'logo_view: ' + logo_view + '<br />';
        s += 'autoMode: ' + autoMode  + '<br />';
        s += 'shouldTick: ' + shouldTick  + '<br />';

        // Add s to debug info
        if (prevDebugInfoHTML !== s) {
            element.innerHTML = s;
            prevDebugInfoHTML = s;
        }
    }

    function updateSelected() {
        if (attachedNode === null) {
            selectedNodeInfo.style.display = 'none'
            return;
        } else if (selectedNodeInfo.style.display === 'none') {
            selectedNodeInfo.style.display = ''
        }
        
        var dist = 0.11;
        if (attachedNode instanceof Person) {
            dist = PERSON_RADIUS;
        } else if (attachedNode instanceof Interest) {
            dist = INTEREST_RADIUS + 0.01;
        }
        dist += 0.02;
        
        // Find position of centre of object on screen
        tempVector2.crossVectors(camera.up, camera.getWorldDirection(tempVector2))
            .cross(camera.getWorldDirection(tempVector1))
            .multiplyScalar(dist);
        tempVector1.copy(attachedNode.sceneObj.position)
            .add(tempVector2) // Add up vector
            .project(camera); // Project onto screen

        var w = window.innerWidth;
        var h = window.innerHeight;
        var w2 = w/2;
        var h2 = h/2;

        var x = tempVector1.x * w2 + w2;
        var y = tempVector1.y * -h2 + h2;
        selectedNodeInfo.style.left = (x - selectedNodeInfo.offsetWidth / 2) + 'px';
        selectedNodeInfo.style.top = y + 'px';
    }
});

function getImageData(image) {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return context.getImageData( 0, 0, image.width, image.height );
}

function getPixel(imageData, x, y) {
    var position = ( x + imageData.width * y ) * 4, data = imageData.data;
    return { r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ] };
}

function generateTextSprites(scene) {
    var sprites = [];
    for (var i = 0; i < 50; i++) {
        var sprite = makeTextSprite(getRandomWord(), 50);

        var p = generateSpriteCoords();

        sprite.position.set(p.x, p.y, p.z);

        sprites.push(sprite);
        scene.add(sprite);
    }

    return sprites;
}

function generateSpriteCoords() {
    var radius = Math.random()*7+Math.random()*7;
    radius+=3;
    var vector = new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, Math.random()*Math.PI*2, Math.random()*Math.PI*2));
    if (vector.z > 0 && logo_view) vector.z = -vector.z;
    return vector;
}

function makeTextSprite(message, size) {
    var font = "serif";

    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    var context = canvas.getContext('2d');
    context.font = size + "px " + font;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    context = canvas.getContext('2d');

    //colour for the text
    var colour = "#000000";

    // border colour
    context.strokeStyle = colour;
    context.lineWidth = 0;

    // text color
    context.fillStyle = colour;
    context.fillText(message, 0, size);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.userData = {opacityToggle: Math.random() > 0.5, opacitySpeed: 0.006};
    sprite.material.opacity = Math.random()*0.6;
    var s = 2 + Math.random() * 2;
    sprite.scale.set(s,s,s);
    return sprite;
}

function getRandomWord() {
    return ghost_words[Math.floor(Math.random()*ghost_words.length)];
}

function distTo(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(x0-x1,2)+Math.pow(y0-y1,2));
}

