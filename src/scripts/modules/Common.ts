/** @format */

class Common {
    canvas: HTMLCanvasElement | null;
    gl: WebGLRenderingContext | null;
    running: boolean;
    previousTime: number;
    currentTime: number;
    time: number;
    timeScale: number;
    readonly devicePixelRatio: number;

    /**
     * @constructor
     */
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.running = false;
        this.previousTime = 0;
        this.currentTime = 0.0;
        this.time = 0.0;
        this.timeScale = 1.0;
        this.devicePixelRatio = window.devicePixelRatio;
    }

    /**
     * # WebGL を実行するための初期化処理を行う
     * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性値のいずれか
     * @param {WebGLContextAttributes} [option={}] - WebGL コンテキストの初期化オプション
     */
    init(canvas: HTMLCanvasElement | string, option: WebGLContextAttributes = {}) {
        if (canvas instanceof HTMLCanvasElement === true) {
            this.canvas = canvas;
        } else if (Object.prototype.toString.call(canvas) === '[object String]') {
            const c = document.querySelector(`#${canvas}`);
            if (c instanceof HTMLCanvasElement === true) {
                this.canvas = c;
            }
        }
        if (this.canvas == null) {
            throw new Error('invalid argument');
        }
        this.gl = this.canvas.getContext('webgl', option);
        if (this.gl == null) {
            throw new Error('webgl not supported');
        }
    }

    /**
     * # WebGL のレンダリングを開始する前のセットアップを行う
     */
    setup() {
        if (!this.gl) return;
        const gl = this.gl;

        this.previousTime = Date.now();

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
    }

    /**
     * # 板ポリゴンの頂点情報を生成する
     * @param {number} width - 板ポリゴンの幅
     * @param {number} height - 板ポリゴンの高さ
     * @returns {{
     *   planePosition: number[],
     *   planeTexCoord: number[],
     * }} 生成した頂点情報をラップして返却する
     */
    createPlaneAttribute(
        width: number,
        height: number
    ): {
        planePosition: number[];
        planeTexCoord: number[];
    } {
        const x = width * 0.5;
        const y = height * 0.5;
        // Planeの頂点属性
        // prettier-ignore
        const planePosition = [
            -x, y, 0.0,
            x, y, 0.0,
            -x, -y, 0.0,
            x, -y, 0.0
        ];
        // prettier-ignore
        const planeTexCoord = [
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
        ];

        return {
            planePosition,
            planeTexCoord,
        };
    }

    /**
     * # リサイズ処理を行う
     */
    resize() {
        if(!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * # rAF で実行する更新処理
     */
    update() {
        const now = Date.now();
        const deltaTime = (now - this.previousTime) / 1000;
        this.currentTime += deltaTime;
        this.time += deltaTime * this.timeScale;
        this.previousTime = now;
    }
}

export default new Common();
