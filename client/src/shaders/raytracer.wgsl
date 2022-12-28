struct Ray
{
    origin: vec3<f32>,
    direction: vec3<f32>,
    weight: vec3<f32>,
};

struct Material
{
    color: vec3<f32>,
};

//maybe
struct Intersection
{
    position: vec3<f32>,
    normal: vec3<f32>,
};

struct Camera //size 64
{
    pos: vec3<f32>,
    forward: vec3<f32>,
    right: vec3<f32>,
    up: vec3<f32>,
    fov: f32,
};

struct SceneData //size 16
{
    width: i32,
    height: i32,
    nLights: i32,
    nObjects: i32,
};

struct Light //size 32
{
    position: vec3<f32>,
    color: vec3<f32>,
    intensity: f32,
};

struct Object //size 32
{
    data: array<vec4<f32>, 1>,
    material: Material,
};

struct RenderState {
    t: f32,
    color: vec3<f32>,
    hit: bool,
};

const EPS: f32 = 1e-2;
const INFINITY: f32 = 100000.0;
const MAX_RECURSION: i32 = 10;

@group(0) @binding(0) var color_buffer: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> camera: Camera;
@group(0) @binding(2) var<uniform> dynamic_objects: array<Object, 2>;
@group(0) @binding(3) var<storage, read> scene: SceneData;
@group(0) @binding(4) var<storage, read> lights: array<Light>;
@group(0) @binding(5) var<storage, read> static_objects: array<Object>;

@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>)
{
    let screen_pos : vec2<i32> = vec2<i32>(i32(GlobalInvocationID.x), i32(GlobalInvocationID.y));

    var myRay: Ray;
    myRay.direction = normalize(camera.forward +
        camera.right * camera.fov * f32(2 * screen_pos.x - scene.width) / f32(scene.height) -
        camera.up * camera.fov * f32(2 * screen_pos.y - scene.height) / f32(scene.height));
    myRay.origin = camera.pos;
    //myRay.direction = normalize(camera.forward);
    //myRay.origin = camera.pos +
    //    camera.right * f32(2 * screen_pos.x - scene.width) * 0.01 -
    //    camera.up * f32(2 * screen_pos.y - scene.height) * 0.01;
    myRay.weight = vec3<f32>(1.0);

    let pixel_color : vec3<f32> = traceRay(myRay);

    textureStore(color_buffer, screen_pos, vec4<f32>(pixel_color, 1.0));
}

fn traceRay(primaryRay: Ray) -> vec3<f32>
{
    var resColor: vec3<f32> = vec3(0.0, 0.0, 0.0);

    var hitMaterial: Material;
    var hitIntersect: Intersection;
    
    var ray: Ray = primaryRay;

    let travelDist: f32 = rayIntersectScene(&ray, &hitMaterial, &hitIntersect);

    let outputColor: vec3<f32> = calculateColor(&hitMaterial, &hitIntersect, -ray.direction);

    resColor += outputColor * ray.weight;

    return resColor;
}

fn rayIntersectScene(ray: ptr<function, Ray>, hitMaterial: ptr<function, Material>, hitIntersect: ptr<function, Intersection>) -> f32
{
    var best_dist: f32 = INFINITY;
    var intersect: Intersection;
    for(var i: i32 = 0; i < scene.nObjects; i++)
    {
        let cur_dist: f32 = findIntersectionWithSphere(ray, &intersect, dynamic_objects[i].data[0].xyz, dynamic_objects[i].data[0].w);
        if(cur_dist < best_dist)
        {
            best_dist = cur_dist;
            *hitIntersect = intersect;
            *hitMaterial = dynamic_objects[i].material;
        }
    }
    for(var i: i32 = 0; i < 1; i++)
    {
        let cur_dist: f32 = findIntersectionWithPlane(ray, &intersect, static_objects[i].data[0].xyz, static_objects[i].data[0].w);
        if(cur_dist < best_dist)
        {
            best_dist = cur_dist;
            *hitIntersect = intersect;
            *hitMaterial = static_objects[i].material;
        }
    }
    return best_dist;
}

fn calculateColor(material: ptr<function, Material>, intersect: ptr<function, Intersection>, eye: vec3<f32>) -> vec3<f32>
{
    return (*material).color;
}

fn findIntersectionWithPlane(ray: ptr<function, Ray>, intersect: ptr<function, Intersection>, norm: vec3<f32>, dist: f32) -> f32
{
    let a: f32 = dot((*ray).direction, norm);
    if(abs(a) < EPS)
    {
        return INFINITY;
    }
    let b: f32 = dot((*ray).origin, norm) - dist;
    let t: f32 = -b / a;
    if(t < EPS)
    {
        return INFINITY;
    }
    (*intersect).position = (*ray).origin + t*(*ray).direction;;
    (*intersect).normal = norm;
    return t;
}

fn findIntersectionWithSphere(ray: ptr<function, Ray>, intersect: ptr<function, Intersection>, center: vec3<f32>, radius: f32) -> f32
{
    let v: vec3<f32> = (*ray).origin - center;
    let a: f32 = dot(v, (*ray).direction);
    let b: f32 = dot(v, v) - radius*radius;
    let delta: f32 = a*a - b;
    if(delta < EPS)
    {
        return INFINITY;
    }
    var t: f32 = -a-sqrt(delta);
    if(t<EPS)
    {
        t = -a+sqrt(delta);
        if(t<EPS)
        {
            return INFINITY;
        }
    }
    let ipos: vec3<f32> = (*ray).origin + t*(*ray).direction;
    (*intersect).position = ipos;
    (*intersect).normal = normalize(ipos - center);
    return t;
}