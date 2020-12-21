import { Player } from "entity/Player";
import { Logger } from "utility/Logger";
import { WebClientUtil } from "./WebClientUtil";

export class WebClient
{
    constructor(clientId: number)
    {
        this.clientId = clientId;
    }
    public clientId: number;

    public playerId: number;

    public isAdmin: boolean;

    private lastSuccessfulUrl = "/";
    private backUrls: string[] = [];
    public errorToShow: string = null;
    public infoToShow: string = null;

    public lastAccess: number = Date.now();

    public getUrl()
    {
        return this.lastSuccessfulUrl;
    }
    // Allows to traverse requests history with "Back" link
    public popUrl()
    {
        this.backUrls.pop();
        this.lastSuccessfulUrl = this.backUrls[this.backUrls.length - 1];
        return this.lastSuccessfulUrl;
    }

    public appendUrl(url: string)
    {
        this.lastSuccessfulUrl = url;
        this.backUrls.push(url);
    }

    public async attach(playerid: number)
    {
        Logger.info(`Player id ${playerid} logined with client ${this.clientId}`);
        this.playerId = playerid;
        WebClientUtil.clients = WebClientUtil.clients.filter((x) => x.playerId !== this.playerId || x.clientId === this.clientId);
    }

}
