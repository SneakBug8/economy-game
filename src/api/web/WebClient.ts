import { Player } from "entity/Player";
import { Logger } from "utility/Logger";

export class WebClient
{
    constructor(clientId: number) {
        this.clientId = clientId;
    }
    public clientId: number;

    public playerId: number;

    public isAdmin: boolean;

    private lastSuccessfulUrl = "/";
    private backUrls: string[] = [];
    public errorToShow: string = null;
    public infoToShow: string = null;

    public getUrl() {
        return this.lastSuccessfulUrl;
    }
    // Allows to traverse requests history with "Back" link
    public popUrl() {
        this.backUrls.pop();
        this.lastSuccessfulUrl = this.backUrls[this.backUrls.length - 1];
        return this.lastSuccessfulUrl;
    }

    public appendUrl(url: string) {
        this.lastSuccessfulUrl = url;
        this.backUrls.push(url);
    }

    public async attach(playerid: number) {
        Logger.info(`Player ${playerid} logined`);
        this.playerId = playerid;
    }

}
