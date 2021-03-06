import type WebSocket from 'ws';

export interface User {
    id: string;
    client: WebSocket;
    userName?: string; // for RoomManager testing puporses
}

export interface Item {
    id?: string;
    creationDate?: Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UpdateData = { id: string; [key: string]: any };

export type LockData = { itemIds: string[]; lockState: boolean };

export type UserData = { userAction: 'join' | 'update'; user: User } | { userAction: 'leave'; id: string };

interface WSBaseMessage {
    userId: 'admin' | string;
}

interface WSInitMessage extends WSBaseMessage {
    type: 'init';
    content: { items: Item[]; users: User[]; ownId: string };
}

interface WSAddMessage extends WSBaseMessage {
    type: 'add';
    content: Item[];
}

interface WSUpdateMessage extends WSBaseMessage {
    type: 'update';
    content: UpdateData[];
}

interface WSDeleteMessage extends WSBaseMessage {
    type: 'delete';
    content: string[];
}

interface WSChatMessage extends WSBaseMessage {
    type: 'chat';
    content: Item;
}

interface WSLockMessage extends WSBaseMessage {
    type: 'lock';
    content: LockData;
}

interface WSUserMessage extends WSBaseMessage {
    type: 'user';
    content: UserData;
}

interface WSErrorMessage extends WSBaseMessage {
    type: 'error';
    content: string;
    userId: 'admin';
}

// Messages sent via webSocket
export type WSMessage =
    | WSInitMessage
    | WSAddMessage
    | WSUpdateMessage
    | WSDeleteMessage
    | WSChatMessage
    | WSLockMessage
    | WSUserMessage
    | WSErrorMessage;
