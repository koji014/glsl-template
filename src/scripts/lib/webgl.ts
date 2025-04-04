/** @format */

import { Device } from "./Device";

export class WebGLUtility {
    /**
     * ファイルをプレーンテキストとして読み込む。
     * @param {string} path - 読み込むファイルのパス
     * @return {Promise}
     */
    static loadFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // fetch を使ってファイルにアクセスする
            fetch(path)
                .then((res) => {
                    // テキストとして処理する
                    return res.text();
                })
                .then((text) => {
                    // テキストを引数に Promise を解決する
                    resolve(text);
                })
                .catch((err) => {
                    // なんらかのエラー
                    reject(err);
                });
        });
    }

    /**
     * ファイルを画像として読み込む。
     * @param {string} path - 読み込むファイルのパス
     * @return {Promise}
     */
    static loadImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            // Image オブジェクトの生成
            const img = new Image();
            // ロード完了を検出したいので、先にイベントを設定する
            img.addEventListener(
                'load',
                () => {
                    // 画像を引数に Promise を解決する
                    resolve(img);
                },
                false
            );
            // 読み込む画像のパスを設定する
            img.src = path;
        });
    }

    /**
     * シェーダオブジェクトを生成して返す。
     * コンパイルに失敗した場合は理由をアラートし null を返す。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {string} source - シェーダのソースコード文字列
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {WebGLShader} シェーダオブジェクト
     */
    static createShader(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        source: string,
        type: number
    ): WebGLShader | null {
        // WebGL API を呼び出して、シェーダオブジェクトを生成
        const shader = gl.createShader(type);
        if (!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        } else {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。
     * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {WebGLShader} vs - 頂点シェーダオブジェクト
     * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
     * @return {WebGLProgram} プログラムオブジェクト
     */
    static createProgram(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        vs: WebGLShader,
        fs: WebGLShader
    ): WebGLProgram | null {
        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);
            return program;
        } else {
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。（transform feedback 対応）
     * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
     * @param {WebGL2RenderingContext} gl - WebGL 2.0 コンテキスト
     * @param {WebGLShader} vs - 頂点シェーダオブジェクト
     * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
     * @param {Array.<string>} varyings - 出力する変数名の配列
     * @return {WebGLProgram} プログラムオブジェクト
     */
    static createTransformFeedbackProgram(
        gl: WebGL2RenderingContext,
        vs: WebGLShader,
        fs: WebGLShader,
        varyings: string[]
    ): WebGLProgram | null {
        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);
            return program;
        } else {
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * VBO を生成して返す。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {Array} data - 頂点属性データを格納した配列
     * @return {WebGLBuffer} VBO
     */
    static createVbo(gl: WebGLRenderingContext | WebGL2RenderingContext , data: number[]): WebGLBuffer | null {
        const vbo = gl.createBuffer();
        if (!vbo) return null;

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    /**
     * IBO を生成して返す。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    static createIbo(gl: WebGLRenderingContext | WebGL2RenderingContext , data: number[]): WebGLBuffer | null {
        const ibo = gl.createBuffer();
        if (!ibo) return null;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * IBO を生成して返す。(INT 拡張版)
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {object} ext - getWebGLExtensions の戻り値
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    static createIboInt(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        ext: WebGLExtensions,
        data: number[]
    ): WebGLBuffer {
        if (ext == null || ext.elementIndexUint == null) {
            throw new Error('element index Uint not supported');
        }
        const ibo = gl.createBuffer();
        if (!ibo) throw new Error('Failed to create buffer');

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {string} source - ソースとなる画像のパス
     * @return {Promise}
     */
    static createTextureFromFile(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        source: string
    ): Promise<WebGLTexture | null> {
        return new Promise((resolve) => {
            const img = new Image();
            img.addEventListener(
                'load',
                () => {
                    const tex = gl.createTexture();
                    if (!tex) {
                        resolve(null);
                        return;
                    }

                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                    gl.generateMipmap(gl.TEXTURE_2D);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    resolve(tex);
                },
                false
            );
            img.src = source;
        });
    }

    /**
     * フレームバッファを生成して返す。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLRenderbuffer} renderbuffer - 深度バッファとして設定したレンダーバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    static createFramebuffer(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        width: number,
        height: number
    ): {
        framebuffer: WebGLFramebuffer | null;
        renderbuffer: WebGLRenderbuffer | null;
        texture: WebGLTexture | null;
    } {
        const frameBuffer = gl.createFramebuffer();
        const depthRenderBuffer = gl.createRenderbuffer();
        const fTexture = gl.createTexture();

        if (!frameBuffer || !depthRenderBuffer || !fTexture) {
            return {
                framebuffer: null,
                renderbuffer: null,
                texture: null,
            };
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depthRenderBuffer
        );

        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {
            framebuffer: frameBuffer,
            renderbuffer: depthRenderBuffer,
            texture: fTexture,
        };
    }

    /**
     * フレームバッファを生成して返す。（フロートテクスチャ版）
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {object} ext - getWebGLExtensions の戻り値
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    static createFramebufferFloat(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        ext: WebGLExtensions,
        width: number,
        height: number
    ): {
        framebuffer: WebGLFramebuffer | null;
        texture: WebGLTexture | null;
    } {
        if (ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)) {
            throw new Error('float texture not supported');
        }

        let flg: number;
        if (Device.isMobile() || Device.isIpad()) {
            if (ext.textureHalfFloat) {
                flg = ext.textureHalfFloat.HALF_FLOAT_OES;
            } else {
                throw new Error('textureHalfFloat is not supported');
            }
        } else {
            if (ext.textureFloat != null) {
                flg = gl.FLOAT;
            } else if (ext.textureHalfFloat != null) {
                flg = ext.textureHalfFloat.HALF_FLOAT_OES;
            } else {
                throw new Error('No valid float texture format supported');
            }
        }

        const frameBuffer = gl.createFramebuffer();
        const fTexture = gl.createTexture();

        if (!frameBuffer || !fTexture) {
            return {
                framebuffer: null,
                texture: null,
            };
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {
            framebuffer: frameBuffer,
            texture: fTexture,
        };
    }

    /**
     * フレームバッファを生成して返す。（フロートテクスチャ・WebGL 2.0 版）
     * @param {WebGL2RenderingContext} gl - WebGL コンテキスト
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    static createFramebufferFloat2(
        gl: WebGL2RenderingContext,
        width: number,
        height: number
    ): {
        framebuffer: WebGLFramebuffer | null;
        texture: WebGLTexture | null;
    } {
        const frameBuffer = gl.createFramebuffer();
        const fTexture = gl.createTexture();

        if (!frameBuffer || !fTexture) {
            return {
                framebuffer: null,
                texture: null,
            };
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        // RGBA32F かつ FLOAT
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {
            framebuffer: frameBuffer,
            texture: fTexture,
        };
    }

    /**
     * フレームバッファをリサイズする。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {object} obj - createFramebuffer が返すオブジェクト
     * @param {number} width - リサイズ後の幅
     * @param {number} height - リサイズ後の高さ
     */
    static resizeFramebuffer(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        obj: {
            renderbuffer?: WebGLRenderbuffer | null;
            texture?: WebGLTexture | null;
        },
        width: number,
        height: number
    ): void {
        if (obj == null) {
            return;
        }

        if (
            obj.hasOwnProperty('renderbuffer') === true &&
            gl.isRenderbuffer(obj.renderbuffer as WebGLRenderbuffer)
        ) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, (this as any).buffers.renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        }

        if (obj.hasOwnProperty('texture') === true && gl.isTexture(obj.texture as WebGLTexture)) {
            gl.bindTexture(gl.TEXTURE_2D, (this as any).buffers.texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                width,
                height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null
            );
        }
    }

    /**
     * フレームバッファを削除する。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @param {object} obj - createFramebuffer が返すオブジェクト
     */
    static deleteFramebuffer(
        gl: WebGLRenderingContext | WebGL2RenderingContext ,
        obj: {
            framebuffer?: WebGLFramebuffer | null;
            renderbuffer?: WebGLRenderbuffer | null;
            texture?: WebGLTexture | null;
        }
    ): void {
        if (obj == null) {
            return;
        }

        if (
            obj.hasOwnProperty('framebuffer') === true &&
            gl.isFramebuffer(obj.framebuffer as WebGLFramebuffer)
        ) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteFramebuffer(obj.framebuffer as WebGLFramebuffer);
            obj.framebuffer = null;
        }

        if (
            obj.hasOwnProperty('renderbuffer') === true &&
            gl.isRenderbuffer(obj.renderbuffer as WebGLRenderbuffer)
        ) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.deleteRenderbuffer(obj.renderbuffer as WebGLRenderbuffer);
            obj.renderbuffer = null;
        }

        if (obj.hasOwnProperty('texture') === true && gl.isTexture(obj.texture as WebGLTexture)) {
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.deleteTexture(obj.texture as WebGLTexture);
            obj.texture = null;
        }

        obj = null as any;
    }

    /**
     * 主要な WebGL の拡張機能を取得する。
     * @param {WebGLRenderingContext | WebGL2RenderingContext } gl - WebGL コンテキスト
     * @return {object} 取得した拡張機能
     * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
     * @property {object} textureFloat - フロートテクスチャを利用できるようにする
     * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
     */
    static getWebGLExtensions(gl: WebGLRenderingContext | WebGL2RenderingContext ): WebGLExtensions {
        return {
            elementIndexUint: gl.getExtension('OES_element_index_uint'),
            textureFloat: gl.getExtension('OES_texture_float'),
            textureHalfFloat: gl.getExtension('OES_texture_half_float'),
        };
    }
}

// WebGLExtensions インターフェースの定義
interface WebGLExtensions {
    elementIndexUint: OES_element_index_uint | null;
    textureFloat: OES_texture_float | null;
    textureHalfFloat: OES_texture_half_float | null;
}

interface ShaderProgramOptions {
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attribute: string[];
    stride: number[];
    uniform?: string[];
    type?: string[];
    transformFeedbackVaryings?: string[];
}

export class ShaderProgram {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    attribute: string[];
    stride: number[];
    uniform: string[] | null;
    type: string[] | null;
    transformFeedbackVaryings?: string[];
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    program: WebGLProgram;
    attributeLocation: number[];
    uniformLocation?: (WebGLUniformLocation | null)[] | null;

    /**
     * @constructor
     * @param {WebGLRenderingContext | WebGL2RenderingContext} gl - WebGL コンテキスト
     * @param {object} option - 各種オプション（下記参照）
     * @property {string} vertexShaderSource - 頂点シェーダのソースコード
     * @property {string} fragmentShaderSource - フラグメントシェーダのソースコード
     * @property {Array.<string>} attribute - attribute 変数名
     * @property {Array.<number>} stride - attribute 変数のストライド
     * @property {Array.<string>} uniform - uniform 変数名
     * @property {Array.<string>} type - uniform 変数のタイプ（例: uniform3fv など）
     */
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, option: ShaderProgramOptions) {
        this.gl = gl;
        this.vertexShaderSource = option.vertexShaderSource;
        this.fragmentShaderSource = option.fragmentShaderSource;
        this.attribute = option.attribute;
        this.stride = option.stride;
        this.uniform = option.uniform || null;
        this.type = option.type || null;
        this.transformFeedbackVaryings = option.transformFeedbackVaryings;

        if (
            Array.isArray(this.attribute) !== true ||
            Array.isArray(this.stride) !== true ||
            this.attribute.length !== this.stride.length
        ) {
            throw new Error('attribute or stride does not match');
        }

        if (Array.isArray(this.uniform) === true || Array.isArray(this.type) === true) {
            if (
                Array.isArray(this.uniform) !== true ||
                Array.isArray(this.type) !== true ||
                this.uniform!.length !== this.type!.length
            ) {
                throw new Error('uniform or type does not match');
            }
        } else {
            this.uniform = null;
            this.type = null;
        }

        const vertexShader = WebGLUtility.createShader(
            gl,
            this.vertexShaderSource,
            gl.VERTEX_SHADER
        );
        const fragmentShader = WebGLUtility.createShader(
            gl,
            this.fragmentShaderSource,
            gl.FRAGMENT_SHADER
        );

        if (vertexShader == null || fragmentShader == null) {
            throw new Error('shader compilation failed');
        }

        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        let program: WebGLProgram | null;

        if (
            gl instanceof WebGL2RenderingContext &&
            Array.isArray(this.transformFeedbackVaryings) === true &&
            this.transformFeedbackVaryings.length > 0
        ) {
            program = WebGLUtility.createTransformFeedbackProgram(
                gl,
                this.vertexShader,
                this.fragmentShader,
                this.transformFeedbackVaryings
            );
        } else {
            program = WebGLUtility.createProgram(gl, this.vertexShader, this.fragmentShader);
        }

        if (program == null) {
            throw new Error('shader program creation failed');
        }

        this.program = program;

        this.attributeLocation = this.attribute.map((attributeName) => {
            const attributeLocation = gl.getAttribLocation(this.program, attributeName);
            if (attributeLocation < 0) {
                console.warn(`"${attributeName}" is an invalid attribute variable`);
            }
            return attributeLocation;
        });

        if (this.uniform != null) {
            this.uniformLocation = this.uniform.map((uniformName) => {
                const uniformLocation = gl.getUniformLocation(this.program, uniformName);
                if (uniformLocation == null) {
                    console.warn(`"${uniformName}" is an invalid uniform variable`);
                }
                return uniformLocation;
            });
        }
    }

    /**
     * プログラムオブジェクトを選択状態にする。
     */
    use(): void {
        this.gl.useProgram(this.program);
    }

    /**
     * VBO を IBO をバインドし有効化する。
     * @param {Array.<WebGLBuffer>} vbo - VBO を格納した配列
     * @param {WebGLBuffer} [ibo=null] - IBO
     */
    setAttribute(vbo: WebGLBuffer[], ibo: WebGLBuffer | null = null): void {
        const gl = this.gl;
        if (Array.isArray(vbo) !== true || vbo.length !== this.attribute.length) {
            throw new Error('vbo or attribute does not match');
        }

        vbo.forEach((v, index) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, v);
            gl.enableVertexAttribArray(this.attributeLocation[index]);
            gl.vertexAttribPointer(
                this.attributeLocation[index],
                this.stride[index],
                gl.FLOAT,
                false,
                0,
                0
            );
        });

        if (ibo != null) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

    /**
     * uniform 変数をまとめてシェーダに送る。
     * @param {Array} value - 各変数の値
     */
    setUniform(value: any[]): void {
        const gl = this.gl;
        if (this.uniform == null) {
            return;
        }

        if (Array.isArray(value) !== true || value.length !== this.uniform.length) {
            throw new Error('value is an invalid');
        }

        value.forEach((v, index) => {
            const type = this.type![index];
            if (type.includes('Matrix') === true) {
                (gl as any)[type](this.uniformLocation![index], false, v);
            } else {
                (gl as any)[type](this.uniformLocation![index], v);
            }
        });
    }
}