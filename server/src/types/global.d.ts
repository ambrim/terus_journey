interface Character
{
    pos: number[];
    facing: number;
    score: number;
}

interface Gem
{
    pos?: number[];
    collected: boolean;
}

interface RenderData
{
    message?: string;
    time?: number;
    player1?: Character;
    player2?: Character;
    gem1?: Gem;
    gem2?: Gem;
    gem3?: Gem;
    gem4?: Gem;
    gem5?: Gem;
    gem6?: Gem;
    gem7?: Gem;
    gem8?: Gem;
    gem9?: Gem;
    gem10?: Gem;
}