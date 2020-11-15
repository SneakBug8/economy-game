export interface IApiProvider {
    sendOffline(playerId: number, message: string): Promise<void>;
    broadcast(message: string): Promise<void>;
}