/** @format */

import { WebGLUtility, ShaderProgram } from '../lib/webgl';
import Common from './Common';
import Gui, { Options } from './Gui';
import base_vert from '../../shaders/vert/base.vert?raw';
import output_frag from '../../shaders/frag/output.frag?raw';

interface Geometry {
    position: number[];
    vbo: WebGLBuffer[];
    attribute: string[];
    stride: number[];
}

export default class Output {
    plane: Geometry | null;
    shaderProgram: ShaderProgram | null;
    options: Options;
    gui: Gui;

    /**
     * #@constructor
     */
    constructor() {
        this.plane = null;
        this.shaderProgram = null;

        this.options = {
            timeScale: Common.timeScale,
            isHoge: false,
        }
        this.gui = new Gui(this.options);
    }

    /**
     * #最終出力シーン描画の準備
     */
    init() {
        if (!Common.gl) return;

        const { planePosition } = Common.createPlaneAttribute(2.0, 2.0);
        const planeVbo = [WebGLUtility.createVbo(Common.gl, planePosition) ?? []];
        const planeAttribute = ['position'];
        const planeStride = [3];
        this.plane = {
            position: planePosition,
            vbo: planeVbo,
            attribute: planeAttribute,
            stride: planeStride,
        };

        this.load();
    }

    /**
     * #シェーダを読み込む
     */
    private load() {
        if (!Common.gl || !this.plane) return;

        // 最終出力シーン用のシェーダ
        this.shaderProgram = new ShaderProgram(Common.gl, {
            vertexShaderSource: base_vert,
            fragmentShaderSource: output_frag,
            attribute: this.plane.attribute,
            stride: this.plane.stride,
            // prettier-ignore
            uniform: [
                'uTime',
            ],
            // prettier-ignore
            type: [
                'uniform1f',
            ],
        });
    }

    /**
     * #リサイズ処理を行う
     */
    // resize() {}

    /**
     * #最終出力シーンの描画
     */
    private render() {
        if (!Common.gl || !Common.canvas || !this.shaderProgram || !this.plane) {
            console.error('WebGL context, canvas, shader program or plane geometry is missing.');
            return;
        }

        try {
            const gl = Common.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(0, 0, Common.canvas.width, Common.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.shaderProgram.use();

            this.shaderProgram.setAttribute(this.plane.vbo);

            this.shaderProgram.setUniform([Common.uTime]);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.plane.position.length / 3);
        } catch (error) {
            console.error('Error during render:', error);
        }
    }

    /**
     * #RAF で実行する更新処理
     */
    update() {
        this.render();
        this.gui.update();
    }
}
