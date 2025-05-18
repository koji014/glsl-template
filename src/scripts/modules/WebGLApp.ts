/** @format */
import Common from './Common';
import Pointer from './Pointer';
import Output from './Output';

export default class WebGLApp {
    private readonly output: Output;

    /**
     * #@constructor
     */
    constructor() {
        this.output = new Output();

        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);

        window.addEventListener('resize', this.resize);
    }

    /**
     * #初期化処理
     * @param {HTMLCanvasElement|string} canvas - canvas への参照か canvas の id 属性値のいずれか
     * @param {WebGLContextAttributes} [option={}] - WebGL コンテキストの初期化オプション
     */
    init(canvas: HTMLCanvasElement | string, option: WebGLContextAttributes = {}) {
        Common.init(canvas, option);
        Pointer.init();
        this.output.init();
    }

    /**
     * #WebGL のレンダリングを開始する前のセットアップを行う。
     */
    setup() {
        Common.setup();
        this.resize();
        Common.running = true;
    }

    /**
     * #WebGL を利用して描画を行う。
     */
    render() {
        if (Common.running === true) {
            requestAnimationFrame(this.render);
        }

        Common.update();
        this.output.update();
    }

    /**
     * #リサイズ処理を行う。
     */
    private resize() {
        Common.resize();
        // this.output.resize();
    }
}
