import { IncomingMessage } from 'http';
import internal from 'stream';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GameServer } from './gserver.js';
import { Player } from './player.js';

export class GameSocketServer
{
    private map: Map<string, WebSocket.WebSocket>;
    private wss: WebSocket.WebSocketServer;

    constructor(gs: GameServer)
    {
        this.map = new Map<string, WebSocket.WebSocket>();
        this.wss = new WebSocket.WebSocketServer({ clientTracking: false, noServer: true });

        this.wss.on('connection', (ws: WebSocket.WebSocket, userId: string) =>
        {
            this.map.set(userId, ws);
            console.log('New client connected!');
            console.log(this.map.keys());
            ws.on('close', () =>
            {
                const oldWs = this.map.get(userId);
                if(oldWs !== undefined && (oldWs.readyState == WebSocket.CLOSING || oldWs.readyState == WebSocket.CLOSED))
                    this.map.delete(userId);
                console.log('Client has disconnected!');
                console.log(this.map.keys());
            });
            ws.on('message', function(data: WebSocket.RawData)
            {
                console.log('Received message %s from user %s', data, userId);
            });
            ws.send('Hello!');

            gs.newPlayer(new Player(userId, ws));
        });
    }

    newId(): string
    {
        while(true)
        {
            const userId = uuidv4();
            if(!this.map.has(userId))
                return userId;
        }
    }

    addConnection(req: IncomingMessage, socket: internal.Duplex, head: Buffer, userId: string): void
    {
        const oldWs = this.map.get(userId);
        if(oldWs !== undefined)
        {
            this.map.delete(userId);
            oldWs.close();
        }
        this.wss.handleUpgrade(req, socket, head, (ws: WebSocket.WebSocket) =>
        {
            this.wss.emit('connection', ws, userId);
        });
    }
}