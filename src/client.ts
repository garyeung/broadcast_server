// broadcast-client.ts
import WebSocket from 'ws';
import readline from 'readline';
import { PROTOCOL } from './config';

export class BroadcastClient {
    private ws: WebSocket | null = null;
    private rl: readline.Interface;
    private username: string = '';
    private serverUrl: string;
    private readonly PROTOCOL = PROTOCOL;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.init();
    }

    private init(): void {
        this.authenticate();
    }

    private authenticate(): void {
        this.rl.question('Enter your username: ', (username) => {
            if (!username.trim()) {
                console.error('\nUsername cannot be empty');
                this.authenticate();
                return;
            }

            this.username = username.trim();
            this.connectToServer();
        });
    }

    private connectToServer(): void {
        try {
            const options = {
                headers: {
                    'X-Username': this.username
                },
            };

            this.ws = new WebSocket(this.serverUrl, this.PROTOCOL, options);

            this.ws.on('open', () => {
                console.log('Connected to server');
                this.typing();
            });

            this.ws.on('error', (error) => {
                console.error('\nConnection failed:', error.message);
                this.cleanup();
            });

            this.ws.on('close', (code, reason) => {
                console.log('\nDisconnected from server:', reason.toString());
                this.cleanup();
            });

            this.ws.on('message', (data) => {
                try {
                     // Clear the current "Typing:" prompt
                process.stdout.write('\r'); // Move cursor back to the beginning of the line
                process.stdout.write(' '.repeat(20)); // Clear the line
                process.stdout.write('\r'); // Move cursor back to the beginning

                // Display the received message
                console.log(`${data.toString()}`);

                // Reprint the "Typing:" prompt
                this.rl.prompt(true);
                } catch (error) {
                    console.error('\nMessage Error:', error);
                }
            });

        } catch (error) {
            console.error('Failed to connect:', error);
            process.exit(1);
        }
    }

    private typing(): void {
        if (!this.ws) return;

        this.rl.question('Typing: ', (message) => {
            const canbeSent = message.trim().toLowerCase();
            if (canbeSent === 'quit' || canbeSent === "exit") {
                this.rl.close();
                this.ws!.close();
                return;
            }
            
            if (canbeSent) {
                this.ws!.send(message);
            }
            
            this.typing();
        });
    }

    private cleanup(){
        if(this.ws){
            this.ws.close();
            this.ws = null;
        }
        this.rl.close();
        process.exit(0);
    }
}