export class GemData
{
    pos: number[] = [0, 0, 0];
    collected: boolean = false;

    constructor(position: number[])
    {
        this.pos[0] = position[0];
        this.pos[1] = position[1];
        this.pos[2] = position[2];
    }
}