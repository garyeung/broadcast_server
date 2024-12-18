import { Command } from "commander";
import { BroadcastServer } from "./broadcastServer";
import { BroadcastClient } from "./client";


const DEFAULT_PORT = 8080;
const DEFAULT_URL = `ws://localhost:${DEFAULT_PORT}`;

const program = new Command();

program
    .name('broadcast-server')
    .description('A simple broadcast server and client implementation')
    .version('0.1.0');

program
    .command('start')
    .description('Start the broadcast server')
    .option('-p, --port <number>', 'port to listen on', DEFAULT_PORT.toString())
    .action((option) => {
        const port = parseInt(option.port);
        new BroadcastServer(port);
    });

program
    .command('connect')
    .description('Connect to the broadcast server')
    .option('-u, --url <string>', 'server URL to connect to', DEFAULT_URL)
    .action((option) => {
        new BroadcastClient(option.url);
    });

program.parse();

export {};