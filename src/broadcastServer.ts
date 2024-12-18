import WebSocket from "ws";
import { createServer, IncomingMessage, Server } from "http";
import { AutenticateClient, Message, PROTOCOL } from "./config";
import { Socket } from "net";

export class BroadcastServer {
    private wss: WebSocket.Server;
    private hs: Server; 
    private clients: Map<WebSocket, string> = new Map();
    protected readonly PROTOCOL = PROTOCOL;

    constructor(port: number){
        this.hs = createServer();
        this.wss = new WebSocket.Server({noServer:true});

        // Bind methods to preserve 'this' context
        this.onHttpUpgrade = this.onHttpUpgrade.bind(this);
        this.onSocketError = this.onSocketError.bind(this);
        this.authenticate = this.authenticate.bind(this);

        this.init(port);
    }

    private init(port: number) {
        this.hs.on('upgrade', this.onHttpUpgrade);
        this.onWebsocketConncetion();

        this.hs.listen(port, () => {
            console.log(`Broadcast Server is running on port ${port}...`)
        });
    }

    private onHttpUpgrade(req: IncomingMessage, socket: Socket, header: Buffer){
        socket.on('error', this.onSocketError);

        this.authenticate(req, (err, client) => {
            if(err || !client) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }
            socket.removeListener('error', this.onSocketError);

            this.wss.handleUpgrade(req, socket, header, (ws) => {
                this.wss.emit("connection", ws, req, client);
            });
        });
    }

    private onSocketError(error: Error){
        console.log(`Socket Error: `, error.message);
    }

    private authenticate(req: IncomingMessage, callback: (err: Error | null, client?: AutenticateClient) => void){
        const protocols = req.headers['sec-websocket-protocol'];
        const username = req.headers['x-username'];

        if(!protocols || !protocols.split(',').map(p => p.trim()).includes(this.PROTOCOL)){
            callback(new Error('Invalid protocol'));
            return;
        }

        if(!username || typeof username !== 'string' || username.trim() === ''){
            callback(new Error("username is required"));
            return;
        }

        let candidateUsername = username.trim();

        const foundInClient = Array.from(this.clients.values())
            .some((name) => name.toLowerCase() === candidateUsername.toLowerCase());

        if(foundInClient){
            callback(new Error('username already taken'));
            return;
        }

        callback(null, {username: candidateUsername});
    }

    private onWebsocketConncetion() {
        this.wss.on('connection', (ws: WebSocket, req: IncomingMessage, client: AutenticateClient) => {
            const username = client.username;
            this.clients.set(ws, username);

            console.log(`${username} has joined the chat`);
            console.log(this.onlineUsers());

            this.broadcast({
                type: 'system',
                payload: this.onlineUsers()
            });

            const findClient = () => {
                return Array.from(this.clients.entries())
                    .find(([client]) => client === ws)?.[1];
            };

            ws.on('message', (message) => {
                const found = findClient();
                if(found){
                    console.log(`${found}: ${message.toString()}`);
                    this.broadcast({
                        type: 'message',
                        payload: message.toString(),
                        username: found 
                    }, ws);
                }
            });

            ws.on('close', () => {
                const username = findClient();
                if (username) {
                    console.log(`${username} has left the chat`);
                    this.broadcast({
                        type: 'system',
                        payload: this.onlineUsers()
                    });
                    this.deleteClient(ws);
                }
            });

            ws.on('error', (err) => {
                console.log("Client Error: ", err.message);
                this.deleteClient(ws);
            });
        });
    }

    private broadcast(message: Message, sender?: WebSocket){
        const toBroadcast = message.type === 'system' 
            ? `System: ${message.payload}`
            : `${message.username}: ${message.payload}`;

        this.clients.forEach((name, client) => {
            if(client !== sender && client.readyState === WebSocket.OPEN){
                client.send(toBroadcast);
            }
        });
    }

    private onlineUsers(){
        return `Current online users: ${this.clients.size}`;
    }

    private deleteClient(ws: WebSocket){
        this.clients.delete(ws);
        console.log(this.onlineUsers());
    }
}