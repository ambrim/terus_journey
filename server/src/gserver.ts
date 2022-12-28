import { IncomingMessage } from "http";
import internal from "stream";
import { GameQueue } from "./gqueue.js";
import { GameSocketServer } from "./gss.js";
import { GameLobby } from './globby.js';
import { Player } from "./player.js";
import { DLL } from "./dll.js";

interface playerLocation_t
{
    lobby: GameLobby;
    pno: number;
}

export class GameServer
{
    static maxLobbySize: number = 2;

    private gss: GameSocketServer;
    private queue: GameQueue;
    private lobbies: DLL;
    private playerMap: Map<string, playerLocation_t>;

    constructor()
    {
        this.gss = new GameSocketServer(this);
        this.queue = new GameQueue(this);
        this.lobbies = new DLL();
        this.playerMap = new Map<string, playerLocation_t>();
        setInterval(this.roundRobin, 4);
    }

    newId(): string
    {
        return this.gss.newId();
    }

    loginPlayer(req: IncomingMessage, socket: internal.Duplex, head: Buffer, userId: string): void
    {
        this.gss.addConnection(req, socket, head, userId);
    }

    newPlayer(player: Player): void
    {
        const prevLocation = this.playerMap.get(player.userId);
        if(prevLocation?.lobby === undefined)
            this.queue.queueUp(player);
        else if(!prevLocation.lobby.attemptRejoin(player, prevLocation.pno))
        {
            this.playerMap.delete(player.userId);
            this.queue.queueUp(player);
        }
        else
        {
            console.log("rejoined");
        }
    }

    makeLobby(people: Player[])
    {
        const newLobby = new GameLobby(people);
        this.lobbies.push_back(newLobby);
        for(let i = 0; i < people.length; i++)
            this.playerMap.set(people[i].userId, { lobby: newLobby, pno: i });
    }

    private roundRobin: () => void = () =>
    {
        const it = new DLL.iterator(this.lobbies);
        it.setFront();
        while(!it.atBack())
        {
            const lobby = <GameLobby>it.get();
            if(lobby.getState() == GameLobby.DEAD)
                it.pop(true);
            else lobby.gameTick();
            it.next();
        }
    };
}