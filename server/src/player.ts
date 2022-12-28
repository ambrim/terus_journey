import WebSocket from "ws";

export class Player
{
    readonly userId: string;
    private ws: WebSocket.WebSocket;

    public lastDirKey: number = 0;
    public lastDirKeyIsDown: boolean = false;
    public pendingJump: boolean = false;

    constructor(userId: string, ws: WebSocket.WebSocket)
    {
        this.userId = userId;
        this.ws = ws;
        ws.on('message', (data: WebSocket.RawData) =>
        {
            /*if((<Buffer>data)[0] === 'W'.charCodeAt(0))
            {
                this.lastDirKey = 0;
                if((<Buffer>data)[1] === '0'.charCodeAt(0))
                    this.lastDirKeyIsDown = true;
                else this.lastDirKeyIsDown = false;
            }
            else if((<Buffer>data)[0] === 'S'.charCodeAt(0))
            {
                this.lastDirKey = 1;
                if((<Buffer>data)[1] === '0'.charCodeAt(0))
                    this.lastDirKeyIsDown = true;
                else this.lastDirKeyIsDown = false;
            }*/
            if((<Buffer>data)[0] === 'A'.charCodeAt(0))
            {
                this.lastDirKey = 2;
                if((<Buffer>data)[1] === '0'.charCodeAt(0))
                    this.lastDirKeyIsDown = true;
                else this.lastDirKeyIsDown = false;
            }
            else if((<Buffer>data)[0] === 'D'.charCodeAt(0))
            {
                this.lastDirKey = 3;
                if((<Buffer>data)[1] === '0'.charCodeAt(0))
                    this.lastDirKeyIsDown = true;
                else this.lastDirKeyIsDown = false;
            }
            else if((<Buffer>data)[0] === ' '.charCodeAt(0))
            {
                if((<Buffer>data)[1] === '0'.charCodeAt(0))
                    this.pendingJump = true;
            }
        })
    }

    validate(): boolean
    {
        const state = this.ws.readyState;
        if(state === undefined || state == WebSocket.CLOSED || state == WebSocket.CLOSING)
            return false;
        else if(state == WebSocket.CONNECTING)
        {
            console.log("Something went terribly wrong. Code: 06499637441373781090");
            this.ws.close();
            return false;
        }
        return true;
    }

    send(data: any): boolean
    {
        if(this.validate())
        {
            this.ws.send(data);
            return true;
        }
        return false;
    }
}