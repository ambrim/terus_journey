import { DLL } from './dll.js';
import { GameServer } from './gserver.js';
import { Player } from './player.js';

export class GameQueue
{
    private queue: DLL;
    private gs: GameServer;
    constructor(gs: GameServer)
    {
        this.queue = new DLL();
        this.gs = gs;
        setInterval(this.attemptMakeLobby, 2000);
    }

    queueUp(player: Player): void
    {
        this.queue.push_back(player);
    }

    attemptMakeLobby: () => void = () =>
    {
        console.log(this.queue.getSize);
        let numPeople: number = 0;
        const it = new DLL.iterator(this.queue);
        it.setFront();
        while(!it.atBack())
        {
            const player: Player = <Player>it.get();
            if(player.validate())
            {
                numPeople++;
                if(numPeople == GameServer.maxLobbySize)
                {
                    const people: Player[] = [];
                    console.log("yay");
                    for(let i = 0; i < GameServer.maxLobbySize; i++)
                        people.push(<Player>this.queue.pop_front());
                    this.gs.makeLobby(people);
                    return;
                }
            }
            else it.pop(true);
            it.next();
        }
    };
}