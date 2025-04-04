/** @format */

import WebGLApp from './modules/WebGLApp';

window.addEventListener(
    'DOMContentLoaded',
    () => {
        const app = new WebGLApp();
        app.init('webgl-canvas');
        app.setup();
        app.render();
    },
    false
);