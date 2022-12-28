export class Character
{
    pos: number[];
    facing: number = 3;
    score: number = 0;

    constructor(position: number[])
    {
        this.pos = position;
    }
}