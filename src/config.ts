export const PROTOCOL = 'chat';

export type ServerMessage = {  
    type:'system';
    payload: string;
}

export type ClientMessage = {
    type:'message';
    username: string;
    payload: string;
}

export type Message  = ClientMessage | ServerMessage;

export interface AutenticateClient {
    username: string;
}