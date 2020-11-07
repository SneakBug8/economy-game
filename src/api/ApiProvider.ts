export interface IApiProvider {
    sendOffline(playerId: number, message: string): Promise<void>;
}