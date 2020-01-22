/*
 * Copyright Callum Tolley and Michael Peran Truscott
 */
//const LINE_COLOR = 0xd3d3d3; // Light gray
const LINE_COLOR = 0x8c8c8c; // Dark gray
const PERSON_COLOR = 0x0081c9;
const INTEREST_COLOR = 0xcc5d29;

const PERSON_RADIUS = 0.08;
const INTEREST_RADIUS = 0.11;

const NODE_WIDTH_SEGMENTS = 20;
const NODE_HEIGHT_SEGMENTS = NODE_WIDTH_SEGMENTS;
const TARGET_THRESHOLD = PERSON_RADIUS/4;
const EXPANDED_THRESHOLD = PERSON_RADIUS/12;

function escapeHTML(s) {
    s = String(s);
    return s.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Returns a list of positions that the searchTerm has been found in the text
function getSearchPositions(text, searchTerm) {
    ret = [];
    if (text == null)
        return ret;
    text = text.toLowerCase();
    var offset = 0;
    while (true) {
        var i = text.indexOf(searchTerm);
        if (i === -1)
            break;
        ret.push(i+offset);
        offset += i+1;
        text = text.slice(i+1);
    }
    return ret;
}

// This function renders a set of search positions in a text
function renderSearchPositions(text, searchTerm, searchPositions) {
    var currentPosition = text.length;
    var ret = '';
    
    // Sort positions to be in descending order
    searchPositions.sort(function(x, y) { return y - x; });
    for (var i = 0; i < searchPositions.length; i++) {
        var start = searchPositions[i];
        var end = start + searchTerm.length;
        
        // 1. copy end..currentPosition to output
        ret = escapeHTML(text.slice(end, currentPosition)) + ret;
        // 2. copy close tag
        ret = '</span>' + ret;
        // 3. copy search term
        ret = escapeHTML(text.slice(start, end)) + ret;
        // 4. copy open tag
        ret = '<span class="search-highlight">' + ret;
        // 5. set current position correctly
        currentPosition = start;
    }
    ret = escapeHTML(text.slice(0, currentPosition)) + ret;
    return ret;
}

function getSearchPositionsForNode(node, searchTerm) {
    var attribs = [];
    if (node instanceof Person) {
        attribs = ['name', 'twitter'];
    } else if (node instanceof Interest) {
        attribs = ['name', 'desc'];
    }
    
    var ret = {};
    for (var i = 0; i < attribs.length; i++) {
        var attrib = attribs[i];
        ret[attrib] = getSearchPositions(node[attrib], searchTerm);
    }
    return ret;
}

function sortSearchResults(results) {
    results.sort(function(a, b) {
        var x = a.searchPositions.length - b.searchPositions.length;
        if (x !== 0)
            return x;
        if (a.node.name < b.node.name)
            return -1;
        if (a.node.name > b.node.name)
            return 1;
        return 0;
    });
    
    return results;
}

// searchPositions is an object where the keys are the attribute names, and the values are the arrays of positions
function SearchResult(node, searchTerm, searchPositions) {
    this.node = node;
    this.searchTerm = searchTerm;
    this.searchPositions = searchPositions;
    
    // Render to html
    this.html = '';
    if (node instanceof Person) {
        this.html += '<h1 class="search-result-person">';
        this.html += renderSearchPositions(node.name, searchTerm, searchPositions['name']);
        this.html += '</h1>';
        if (node.twitter) {
            this.html += '<i class="fa fa-twitter"></i>@';
            this.html += renderSearchPositions(node.twitter, searchTerm, searchPositions['twitter']);
        }
        
    } else if (node instanceof Interest) {
        this.html += '<h1 class="search-result-interest">';
        this.html += renderSearchPositions(node.name, searchTerm, searchPositions['name']);
        this.html += '</h1>';
        this.html += '<i>';
        this.html += renderSearchPositions(node.desc, searchTerm, searchPositions['desc']);
        this.html += '</i>';
    }
}

function Node(type, x, y, z, color, radius) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = z;
    this.vx = 1;
    this.color = color;
    this.radius = radius;
}

Node.prototype.update = function(dt) {
    //in the case of logo view, move to target location
    if (!shouldTick && this.tx != null) {
        if (this.shrink) {
            this.x = moveToTarget(placeWithinThreshold(this.x, this.tx, TARGET_THRESHOLD), this.tx, dt);
            this.y = moveToTarget(placeWithinThreshold(this.y, this.ty, TARGET_THRESHOLD), this.ty, dt);
            this.z = moveToTarget(placeWithinThreshold(this.z, this.tz, TARGET_THRESHOLD), this.tz, dt);
            if (this.x == this.tx && this.y == this.ty && this.z == this.tz) {
                this.sceneObj.material.color.setHex(0xffffff);
            }
        }
        else {
            this.x = moveToTarget(placeWithinThreshold(this.x, this.px, EXPANDED_THRESHOLD), this.px, dt);
            this.y = moveToTarget(placeWithinThreshold(this.y, this.py, EXPANDED_THRESHOLD), this.py, dt);
            this.z = moveToTarget(placeWithinThreshold(this.z, this.pz, EXPANDED_THRESHOLD), this.pz, dt);
        }
    }
	this.sceneObj.position.set(this.x, this.y, this.z);
};

function moveToTarget(coord, target, dt) {
    var speed = 2;
    if (coord != target) {
        return coord+(target-coord)*speed*dt;
    }
    return coord;
}

function placeWithinThreshold(coord, target, threshold) {
    if (withInTheshold(coord, target, threshold)) {
        return target;
    }
    else {
        return coord;
    }
}

function withInTheshold(coord, target, threshold) {
    return coord + threshold > target && coord - threshold < target;
}

function Connection(source, target) {
    this.source = source;
    this.target = target;
}

Connection.prototype.update = function(dt) {
	this.sceneObj.geometry.vertices[0].set(this.source.x, this.source.y, this.source.z);
	this.sceneObj.geometry.vertices[1].set(this.target.x, this.target.y, this.target.z);
	this.sceneObj.geometry.verticesNeedUpdate = true;
};

// Construct Person from a JSON object, o.
function Person(x, y, z, o, interestsMap) {
    Node.call(this, 'Person', x, y, z, PERSON_COLOR, PERSON_RADIUS);

    this.id = o.id;
    this.name = o.name;
    this.twitter = o.twitter;
    this.interests = [];
    if (o.interest1_id) this.interests.push(interestsMap[o.interest1_id]);
    if (o.interest2_id) this.interests.push(interestsMap[o.interest2_id]);
    if (o.interest3_id) this.interests.push(interestsMap[o.interest3_id]);

    for (var i = 0; i < this.interests.length; i++) {
        var interest = this.interests[i];
        interest.numInterested++;
    }
}

Person.prototype = Object.create(Node.prototype);

// Construct Interest from a JSON object, o.
function Interest(x, y, z, o) {
    Node.call(this, 'Interest', x, y, z, INTEREST_COLOR, INTEREST_RADIUS);

    this.id = o.id;
    this.name = o.name;
    this.desc = o.desc;
    this.numInterested = 0;
}

Interest.prototype = Object.create(Node.prototype);

function Graph(scene) {
    // THREE scene
    this.scene = scene;

    // Last time this graph was edited
    this.lastEdited = null;

    // Links between nodes
    this.conns = [];
    
    // Nodes
    this.nodes = [];
    this.simulation = d3_force.forceSimulation(this.nodes)
        .numDimensions(3)
        .force("manyBodies", d3_force.forceManyBody()
            .strength(-0.08)
            .distanceMin(0.05)
            .distanceMax(10.0))
        .force("centering", d3_force.forceCenter(0, 0, 0))
        .force("links", d3_force.forceLink(this.conns)
            .strength(function() { return 0.3; })
            .distance(function() { return 1.0; }));
    this.simulation.stop();

    this.interestsMap = {};
}

// Get interest node based on the id of the interest
Graph.prototype.findInterest = function(interestId) {
    return this.interestsMap[interestId];
};

Graph.prototype.addNode = function(node) {
    var geometry = new THREE.SphereGeometry(node.radius, NODE_WIDTH_SEGMENTS, NODE_HEIGHT_SEGMENTS);
    var material = new THREE.MeshPhongMaterial({
        color: node.color,
        specular: 0x050505,
        shininess: 50
    });

    node.sceneObj = new THREE.Mesh(geometry, material);
    node.sceneObj.position.set(node.x, node.y, node.z);
    node.sceneObj.userData = {isNode: true, node: node};
    this.scene.add(node.sceneObj);
    this.nodes.push(node);
    if (node instanceof Interest) {
        this.interestsMap[node.id] = node;
    }
};

Graph.prototype.addConnection = function(conn) {
    var material = new THREE.LineBasicMaterial({
        color: LINE_COLOR,
        transparent: true
    });
    var geometry = new THREE.Geometry();
    geometry.dynamic = true;
    geometry.vertices.push(new THREE.Vector3(conn.source.x, conn.source.y, conn.source.z));
    geometry.vertices.push(new THREE.Vector3(conn.target.x, conn.target.y, conn.target.z));
    geometry.verticesNeedUpdate = true;

    conn.sceneObj = new THREE.Line(geometry, material);
    conn.sceneObj.frustumCulled = false;
    this.scene.add(conn.sceneObj);
    this.conns.push(conn);
};

Graph.prototype.update = function(dt, shouldTick) {
	// Force graph stuff
    if (shouldTick) {
        this.simulation.tick();
    }
    
    for (var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].update(dt);
    }

    for (var i = 0; i < this.conns.length; i++) {
        this.conns[i].update(dt);
    }
};

Graph.prototype.clear = function() {
    for (var i = 0; i < this.nodes.length; i++) {
        this.scene.remove(this.nodes[i].sceneObj);
    }
    this.nodes.length = 0;

    for (var i = 0; i < this.conns.length; i++) {
        this.scene.remove(this.conns[i].sceneObj);
    }
    this.conns.length = 0;
    this.interestsMap = {};
};

// Remove node and all attached connections
Graph.prototype.removeNodeIndex = function(i) {
    var node = this.nodes[i];
    this.nodes.splice(i, 1);
    node.sceneObj.userData = null;
    this.scene.remove(node.sceneObj);
    
    if (node instanceof Interest) {
        delete this.interestsMap[node.id];
    } else if (node instanceof Person) {
        for (var i = 0; i < node.interests.length; i++) {
            var interest = node.interests[i];
            interest.numInterested--;
        }
    }
    
    for (var j = 0; j < this.conns.length; j++) {
        var conn = this.conns[j];
        if (conn.source === node || conn.target === node) {
            // Remove connection
            this.conns.splice(j, 1);
            j--;
            this.scene.remove(conn.sceneObj);
        }
    }
};

// Search for the string searchTerm in all nodes, and return a list of SearchResult objects
Graph.prototype.search = function(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    var ret = [];
    for (var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];
        var positions = getSearchPositionsForNode(node, searchTerm);
        var keys = Object.keys(positions);
        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            if (positions[key].length > 0) {
                ret.push(new SearchResult(node, searchTerm, positions));
                break;
            }
        }
    }
    
    // Sort search results
    ret = sortSearchResults(ret);
    
    return ret;
};

Graph.prototype.processResponse = function(response) {
    function getRandomPos() {
        return (Math.random() - 0.5) * 3;
    }

    var o = JSON.parse(response);
    var newLastEdited = Date.parse(o.last_edited);
    if (this.lastEdited === null || newLastEdited !== this.lastEdited) {
        // Update
        this.lastEdited = newLastEdited;
        console.log("Updating graph: " + response);
    } else {
        console.log("Graph already up to date");
        return;
    }

    // Delete nodes that are not in the JSON
    for (var i = 0; i < this.nodes.length; i++) {
        var node = this.nodes[i];

        // Search for node
        var del = false;
        if (node instanceof Person) {
            del = true;
            for (var j = 0; j < o.people.length; j++) {
                if (o.people[j].id === node.id) {
                    del = false;
                    break;
                }
            }
        } else if (node instanceof Interest) {
            del = true;
            for (var j = 0; j < o.interests.length; j++) {
                if (o.interests[j].id === node.id) {
                    del = false;
                    break;
                }
            }
        } else {
            del = true;
        }
        // If not found, delete
        if (del) {
            this.removeNodeIndex(i);
            i--;
        }
    }

    // Add nodes that are in the JSON but not in the world
    for (var i = 0; i < o.interests.length; i++) {
        // Check if it is in the world already
        var found = false;
        for (var j = 0; j < this.nodes.length; j++) {
            var node = this.nodes[j];
            if (node instanceof Interest && node.id === o.interests[i].id) {
                // Don't add
                found = true;
                break;
            }
        }
        if (!found) {
            var interest = new Interest(getRandomPos(), getRandomPos(), getRandomPos(), o.interests[i]);
            this.addNode(interest);
        }
    }
    var personNodes = [];
    for (var i = 0; i < o.people.length; i++) {
        // Check if it is in the world already
        var found = false;
        for (var j = 0; j < this.nodes.length; j++) {
            var node = this.nodes[j];
            if (node instanceof Person && node.id === o.people[i].id) {
                // Don't add
                found = true;
                break;
            }
        }
        if (!found) {
            // Add to world
            var person = new Person(getRandomPos(), getRandomPos(), getRandomPos(), o.people[i], this.interestsMap);
            this.addNode(person);
            personNodes.push(person);
        }
    }

    // For each person, add all the connections
    for (var i = 0; i < personNodes.length; i++) {
        var pn = personNodes[i];

        // For every interest that person has
        for (var j = 0; j < pn.interests.length; j++) {
            var personInterest = pn.interests[j];

            // Add a connection between that person and their interest
            this.addConnection(new Connection(pn, personInterest));
        }
    }
    
    // Add links to sim
    this.simulation.force("links").links(this.conns);
    this.simulation.nodes(this.nodes);
    this.simulation.alpha(1);
    this.simulation.stop();
};
