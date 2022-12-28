import rasterizer_kernel from "./shaders/rasterizer.wgsl";
import screen_shader from "./shaders/screen_shader.wgsl";
import { Scene } from "./scene";
import { Level } from "./level.js";

import tex_font_url from '../../media/game_font.png';
import bg1_1 from '../../media/bg/1/layers/sky.png';
import bg1_2 from '../../media/bg/1/layers/clouds_1.png';
import bg1_3 from '../../media/bg/1/layers/clouds_2.png';
import bg1_4 from '../../media/bg/1/layers/rocks_1.png';
import bg1_5 from '../../media/bg/1/layers/clouds_3.png';
import bg1_6 from '../../media/bg/1/layers/rocks_2.png';
import bg1_7 from '../../media/bg/1/layers/clouds_4.png';
const URLS_BG = [
    [bg1_1, bg1_2, bg1_3, bg1_4, bg1_5, bg1_6, bg1_7]
];
import char1 from '../../media/char/1.png';
import char2 from '../../media/char/2.png';
const URLS_CHARS = [char1, char2];
import gem from '../../media/gems/gems.png';
const URL_GEM = gem;

export class Renderer
{
    private static FPS_ANIMATION: number = 20;

    private scene: Scene;
    private pno: number = 1;

    private device: GPUDevice;
    private context: GPUCanvasContext;

    private width: number;
    private height: number;

    private color_buffer!: GPUTexture;
    private color_buffer_view!: GPUTextureView;
    private screen_sampler!: GPUSampler;

    private rep_rep_sampler!: GPUSampler;
    private clm_rep_sampler!: GPUSampler;
    private rep_clm_sampler!: GPUSampler;
    private clm_clm_sampler!: GPUSampler;

    private tex_font!: GPUTexture;
    private tex_font_view!: GPUTextureView;
    private tex_bg!: GPUTexture[];
    private tex_bg_view!: GPUTextureView[];
    private buffer_bg_scales!: GPUBuffer;
    private tex_chars!: GPUTexture;
    private tex_chars_view!: GPUTextureView;
    private tex_gem!: GPUTexture;
    private tex_gem_view!: GPUTextureView;

    private bufferData!: GPUBuffer;
    private bufferCamera!: GPUBuffer;
    private bufferDynamicObjects!: GPUBuffer;
    private bufferScene!: GPUBuffer;
    private bufferEnv!: GPUBuffer;
    private bufferStaticObjects!: GPUBuffer;

    private raster_pipeline!: GPUComputePipeline;
    private raster_bind_group!: GPUBindGroup;
    private sampler_bind_group!: GPUBindGroup;
    private tex_bind_group!: GPUBindGroup;

    private screen_pipeline!: GPURenderPipeline;
    private screen_bind_group!: GPUBindGroup;

    constructor(device: GPUDevice, context: GPUCanvasContext, scene: Scene)
    {
        this.device = device;
        this.context = context;
        this.width = (<HTMLCanvasElement>context.canvas).width;
        this.height = (<HTMLCanvasElement>context.canvas).height;
        this.scene = scene;
    }

    async initialize()
    {
        this.createAssets();
        await this.loadAssets();
        this.makePipeline();
        this.prepareScene();
    }

    private createAssets()
    {
        //compute output texture
        this.color_buffer = this.device.createTexture(
            {
                size: {
                    width: this.width,
                    height: this.height,
                },
                format: "rgba8unorm",
                usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
            }
        );
        this.color_buffer_view = this.color_buffer.createView();

        this.rep_rep_sampler = this.device.createSampler({
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        });
        this.clm_rep_sampler = this.device.createSampler({
            addressModeU: "clamp-to-edge",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        });
        this.rep_clm_sampler = this.device.createSampler({
            addressModeU: "repeat",
            addressModeV: "clamp-to-edge",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        });
        this.clm_clm_sampler = this.device.createSampler({
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        });

        this.screen_sampler = this.device.createSampler({
            addressModeU: "repeat",
            addressModeV: "repeat",
            magFilter: "linear",
            minFilter: "nearest",
            mipmapFilter: "nearest",
            maxAnisotropy: 1
        });

        //scene uniform data
        this.bufferData = this.device.createBuffer({
            size: 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //camera parameters
        this.bufferCamera = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //dynamic objects
        this.bufferDynamicObjects = this.device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        //scene parameters
        this.bufferScene = this.device.createBuffer({
            size: 24,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        //scene lights
        this.bufferEnv = this.device.createBuffer({
            size: 80 * Level.colliders.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        //static objects
        this.bufferStaticObjects = this.device.createBuffer({
            size: 32 * this.scene.gems.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });


        //scale of each background layer
        this.buffer_bg_scales = this.device.createBuffer({
            size: 4 * 10,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
    }

    private async webGPUTextureFromImageUrl(url: string)
    {
        const response = await fetch(url);
        const blob = await response.blob();
        const imgBitmap = await createImageBitmap(blob);

        const textureDescriptor: GPUTextureDescriptor = {
            size: { width: imgBitmap.width, height: imgBitmap.height },
            format: 'rgba8unorm',
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        };
        const texture = this.device.createTexture(textureDescriptor);

        this.device.queue.copyExternalImageToTexture(
            { source: imgBitmap },
            { texture: texture },
            { width: imgBitmap.width, height: imgBitmap.height }
        );
        return texture;
    }

    private async webGPUTextureArrayFromImageUrls(urls: string[])
    {
        let texture!: GPUTexture;
        for(let i = 0; i < urls.length; i++)
        {
            const response = await fetch(urls[i]);
            const blob = await response.blob();
            const imgBitmap = await createImageBitmap(blob);

            if(i == 0)
            {
                texture = this.device.createTexture({
                    size: { width: imgBitmap.width, height: imgBitmap.height, depthOrArrayLayers: urls.length },
                    format: 'rgba8unorm',
                    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
                });
            }

            this.device.queue.copyExternalImageToTexture(
                { source: imgBitmap },
                { texture: texture, origin: [0, 0, i] },
                { width: imgBitmap.width, height: imgBitmap.height, depthOrArrayLayers: 1 }
            );
        }

        return texture;
    }

    private async loadAssets()
    {
        this.tex_font = await this.webGPUTextureFromImageUrl(tex_font_url);
        this.tex_font_view = this.tex_font.createView();

        this.tex_bg = [];
        this.tex_bg_view = [];
        this.tex_bg[0] = await this.webGPUTextureArrayFromImageUrls(URLS_BG[0]);
        for(let i = 0; i < this.tex_bg.length; i++)
            this.tex_bg_view[i] = this.tex_bg[i].createView();

        this.tex_chars = await this.webGPUTextureArrayFromImageUrls(URLS_CHARS);
        this.tex_chars_view = this.tex_chars.createView();

        this.tex_gem = await this.webGPUTextureFromImageUrl(URL_GEM);
        this.tex_gem_view = this.tex_gem.createView();
    }

    private makePipeline()
    {
        const raster_bind_group_layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    storageTexture: {
                        access: "write-only",
                        format: "rgba8unorm",
                        viewDimension: "2d"
                    }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform",
                    }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform",
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "uniform",
                    }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 5,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 6,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                }
            ]
        });

        this.raster_bind_group = this.device.createBindGroup({
            layout: raster_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.color_buffer_view
                },
                {
                    binding: 1,
                    resource: {
                        buffer: this.bufferData,
                    }
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.bufferCamera,
                    }
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.bufferDynamicObjects,
                    }
                },
                {
                    binding: 4,
                    resource: {
                        buffer: this.bufferScene,
                    }
                },
                {
                    binding: 5,
                    resource: {
                        buffer: this.bufferEnv,
                    }
                },
                {
                    binding: 6,
                    resource: {
                        buffer: this.bufferStaticObjects,
                    }
                }
            ]
        });

        //sampler bind group
        const sampler_bind_group_layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    sampler: {}
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    sampler: {}
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    sampler: {}
                },
            ]
        });

        this.sampler_bind_group = this.device.createBindGroup({
            layout: sampler_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.rep_rep_sampler
                },
                {
                    binding: 1,
                    resource: this.clm_rep_sampler
                },
                {
                    binding: 2,
                    resource: this.rep_clm_sampler
                },
                {
                    binding: 3,
                    resource: this.clm_clm_sampler
                },
            ]
        });


        //character bind group
        const tex_bind_group_layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: { viewDimension: '2d-array' }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: {
                        type: "read-only-storage",
                        hasDynamicOffset: false
                    }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: { viewDimension: '2d-array' }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    texture: {}
                },
            ]
        });

        this.tex_bind_group = this.device.createBindGroup({
            layout: tex_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.tex_font_view
                },
                {
                    binding: 1,
                    resource: this.tex_bg_view[0]
                },
                {
                    binding: 2,
                    resource: {
                        buffer: this.buffer_bg_scales,
                    }
                },
                {
                    binding: 3,
                    resource: this.tex_chars_view
                },
                {
                    binding: 4,
                    resource: this.tex_gem_view
                },
            ]
        });

        //compute pipeline
        const raster_pipeline_layout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                raster_bind_group_layout,
                sampler_bind_group_layout,
                tex_bind_group_layout
            ]
        });

        this.raster_pipeline = this.device.createComputePipeline({
            layout: raster_pipeline_layout,

            compute: {
                module: this.device.createShaderModule({
                    code: rasterizer_kernel,
                }),
                entryPoint: 'main',
            },
        });

        const screen_bind_group_layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {}
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {}
                },
            ]

        });

        //screen pipeline (and groups)
        this.screen_bind_group = this.device.createBindGroup({
            layout: screen_bind_group_layout,
            entries: [
                {
                    binding: 0,
                    resource: this.screen_sampler
                },
                {
                    binding: 1,
                    resource: this.color_buffer_view
                }
            ]
        });

        const screen_pipeline_layout = this.device.createPipelineLayout({
            bindGroupLayouts: [screen_bind_group_layout]
        });

        this.screen_pipeline = this.device.createRenderPipeline({
            layout: screen_pipeline_layout,

            vertex: {
                module: this.device.createShaderModule({
                    code: screen_shader,
                }),
                entryPoint: 'vert_main',
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: screen_shader,
                }),
                entryPoint: 'frag_main',
                targets: [
                    {
                        format: "bgra8unorm"
                    }
                ]
            },

            primitive: {
                topology: "triangle-list"
            }
        });

    }

    private prepareScene()
    {
        const bg_scales = new Float32Array([1000, 200, 150, 100, 75, 50, 40, 0, 0, 0]);
        this.device.queue.writeBuffer(this.buffer_bg_scales, 0, bg_scales, 0, 10);

        const sceneData: Int32Array = new Int32Array(6);
        sceneData[0] = this.width;
        sceneData[1] = this.height;
        sceneData[2] = this.scene.characters.length; //dynamic
        sceneData[3] = this.scene.gems.length; //nGems
        sceneData[4] = 7; //background layers count
        sceneData[5] = Level.colliders.length;
        this.device.queue.writeBuffer(this.bufferScene, 0, sceneData, 0, 6);

        for(let i = 0; i < Level.colliders.length; i++)
        {
            this.device.queue.writeBuffer(this.bufferEnv, 80 * i, Level.colliders[i].handles, 0, 16);
            this.device.queue.writeBuffer(this.bufferEnv, 80 * i + 64, Level.colliders[i].info, 0, 4);
        }
    }

    setPlayer(pno: number)
    {
        this.pno = pno;
        this.device.queue.writeBuffer(this.bufferData, 4, new Int32Array([pno]), 0, 1);
    }

    private updateData()
    {
        this.device.queue.writeBuffer(
            this.bufferData, 0, new Int32Array([
                Math.floor(this.scene.time / 1000 * Renderer.FPS_ANIMATION),
            ]), 0, 1
        );
    }
    private updateCamera()
    {
        /*this.device.queue.writeBuffer(
            this.bufferCamera, 0, new Float32Array([
                this.scene.camera.position[0],
                this.scene.camera.position[1],
                this.scene.camera.position[2],
                this.scene.camera.fov
            ]), 0, 4
        );*/
        this.device.queue.writeBuffer(
            this.bufferCamera, 0, new Float32Array([
                this.scene.characters[this.pno].pos[0],
                this.scene.characters[this.pno].pos[1],
                this.scene.characters[this.pno].pos[2],
                this.scene.camera.fov
            ]), 0, 4
        );
    }

    private updateGems()
    {
        const objectData_f32: Float32Array = new Float32Array(4);
        const objectData_i32: Int32Array = new Int32Array(4);
        for(let i = 0; i < this.scene.gems.length; i++)
        {
            console.log(this.scene.gems[i].pos);
            objectData_f32[0] = this.scene.gems[i].pos[0];
            objectData_f32[1] = this.scene.gems[i].pos[1];
            objectData_f32[2] = this.scene.gems[i].pos[2];
            objectData_f32[3] = 0.0;
            console.log(objectData_f32);
            this.device.queue.writeBuffer(this.bufferStaticObjects, 32 * i, objectData_f32, 0, 4);

            objectData_i32[0] = this.scene.gems[i].collected ? 1 : 0;
            objectData_i32[1] = 0;
            objectData_i32[2] = 0;
            objectData_i32[3] = 0;
            this.device.queue.writeBuffer(this.bufferStaticObjects, 32 * i + 16, objectData_i32, 0, 4);
        }
    }

    private updateDynamic()
    {
        const objectData_f32: Float32Array = new Float32Array(4);
        const objectData_i32: Int32Array = new Int32Array(4);
        for(let i = 0; i < 2; i++)
        {
            objectData_f32[0] = this.scene.characters[i].pos[0];
            objectData_f32[1] = this.scene.characters[i].pos[1];
            objectData_f32[2] = this.scene.characters[i].pos[2];
            objectData_f32[3] = 0.0;
            this.device.queue.writeBuffer(this.bufferDynamicObjects, 32 * i, objectData_f32, 0, 4);

            objectData_i32[0] = this.scene.characters[i].facing;
            objectData_i32[1] = 0;
            objectData_i32[2] = 0;
            objectData_i32[3] = 0;
            this.device.queue.writeBuffer(this.bufferDynamicObjects, 32 * i + 16, objectData_i32, 0, 4);
        }
    }

    render = () =>
    {
        this.updateData();
        this.updateCamera();
        this.updateGems();
        this.updateDynamic();

        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();

        const ray_trace_pass: GPUComputePassEncoder = commandEncoder.beginComputePass();
        ray_trace_pass.setPipeline(this.raster_pipeline);
        ray_trace_pass.setBindGroup(0, this.raster_bind_group);
        ray_trace_pass.setBindGroup(1, this.sampler_bind_group);
        ray_trace_pass.setBindGroup(2, this.tex_bind_group);
        ray_trace_pass.dispatchWorkgroups(this.width, this.height, 1);
        ray_trace_pass.end();

        const textureView: GPUTextureView = this.context.getCurrentTexture().createView();
        const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }]
        });

        renderpass.setPipeline(this.screen_pipeline);
        renderpass.setBindGroup(0, this.screen_bind_group);
        renderpass.draw(6, 1, 0, 0);

        renderpass.end();

        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.render);
    };

}