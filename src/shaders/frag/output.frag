precision mediump float;

uniform float uTime;
varying vec2 vTexCoord;

void main() {
    gl_FragColor = vec4(vTexCoord, 1.0, 1.0);
}
