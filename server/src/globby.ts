import { Player } from "./player.js";
import { Game } from "./game.js";

declare type GameState = 0 | 1 | 2;

export class GameLobby
{
    public static DEAD: GameState = 0;
    public static ACTIVE: GameState = 1;
    public static PAUSED: GameState = 2;

    public static INACTIVE_TIME: number = 10000; //in milliseconds

    private state: GameState;
    private lastActive: number;

    private players: Player[];
    private game: Game;

    constructor(people: Player[])
    {
        this.state = GameLobby.ACTIVE;
        this.players = people;

        this.game = new Game(this.players);
        for(let i = 0; i < people.length; i++)
            people[i].send(JSON.stringify({ message: "Player " + i }));

        this.lastActive = performance.now();
    }

    getState(): GameState
    {
        return this.state;
    }

    attemptRejoin(player: Player, pno: number): boolean
    {
        if(this.state == GameLobby.DEAD)
            return false;
        if(this.players[pno].validate())
            return false;
        this.players[pno] = player;
        player.send(JSON.stringify({ message: "Player " + pno }));
        this.lastActive = performance.now();
        return true;
    }

    gameTick(): void
    {
        let foundActive: boolean = false;
        const renderData: string = JSON.stringify(this.game.physics());
        for(let i = 0; i < this.players.length; i++)
        {
            if(this.players[i].send(renderData))
                foundActive = true;
        }
        let time = performance.now();
        if(!foundActive && time - this.lastActive >= GameLobby.INACTIVE_TIME)
            this.state = GameLobby.DEAD;
        else if(foundActive)
            this.lastActive = performance.now();
    }
}