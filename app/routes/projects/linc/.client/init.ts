
import sphereJsonUrl from './models/Sphere.json?url';
import logoPngUrl from '../img/demo/logo.png?url';
import logoOrangePngUrl from '../img/demo/logo_orange.png?url';
import logoFadePngUrl from '../img/demo/logo_fade.png?url';

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.async = true;
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(s);
    });
}

export async function initLinc(options: {
    helpMinimizeButtonRef: HTMLAnchorElement | null;
    helpMaximizeButtonRef: HTMLAnchorElement | null;
    toggleAutoRef: HTMLInputElement | null;
    toggleLogoRef: HTMLInputElement | null;
}): Promise<void> {
    window.exports = {}
    window.exports.WIRE_SPHERE_URL = sphereJsonUrl;
    window.exports.LOGO_PNG_URL = logoPngUrl;
    window.exports.LOGO_ORANGE_PNG_URL = logoOrangePngUrl;
    window.exports.LOGO_FADE_PNG_URL = logoFadePngUrl;
    window.exports.helpMinimizeButtonRef = options.helpMinimizeButtonRef;
    window.exports.helpMaximizeButtonRef = options.helpMaximizeButtonRef;
    window.exports.toggleAutoRef = options.toggleAutoRef;
    window.exports.toggleLogoRef = options.toggleLogoRef;

    await loadScript('https://unpkg.com/d3@4.0.0/build/d3.min.js');
    await loadScript('https://unpkg.com/d3-force@1.0.6/build/d3-force.min.js');
    await loadScript('https://unpkg.com/three@0.85.0/build/three.min.js');

    // THREE examples (prefer vendored where present)
    await loadScript((await import('./three/examples/controls/OrbitControls.js?url')).default);
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/shaders/CopyShader.js');
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/shaders/DigitalGlitch.js');
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/postprocessing/EffectComposer.js');
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/postprocessing/RenderPass.js');
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/postprocessing/MaskPass.js');
    await loadScript('https://unpkg.com/three@0.85.0/examples/js/postprocessing/ShaderPass.js');
    await loadScript((await import('./three/examples/postprocessing/GlitchPass.js?url')).default);

    // Core LINC legacy scripts (run in global scope)
    await loadScript((await import('./wordlist.js?url')).default);
    await loadScript((await import('./graph.js?url')).default);
    await loadScript((await import('./display.js?url')).default);

    // Trigger legacy onload handler in display.js
    window.dispatchEvent(new Event('load'));
}


