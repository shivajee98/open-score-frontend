declare module 'phoenix' {
    export class Socket {
        constructor(url: string, opts?: any);
        connect(): void;
        channel(topic: string, chanArgs?: any): Channel;
    }
    export class Channel {
        join(): Push;
        on(event: string, callback: (payload: any) => void): void;
        push(event: string, payload: any): Push;
        receive(status: string, callback: (resp: any) => void): Push;
    }
    export class Push {
        receive(status: string, callback: (resp: any) => void): Push;
    }
}
