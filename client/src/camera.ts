export class Camera
{
    position: Float32Array;
    fov: number = 10.0;

    constructor(position: number[])
    {
        this.position = new Float32Array(position);
    }
}