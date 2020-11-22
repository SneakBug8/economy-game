import { Player } from "entity/Player";

export class WebClient
{
    constructor(clientId: number) {
        this.clientId = clientId;
    }
    public clientId: number;

    public playerId: number;
    public actorId: number;

    public isAdmin: boolean;

    private lastSuccessfulUrl = "/";
    private backUrls: string[] = [];
    public errorToShow: string = null;

    public getUrl() {
        return this.lastSuccessfulUrl;
    }
    // Allows to traverse requests history with "Back" link
    public popUrl() {
        const res = this.lastSuccessfulUrl;
        this.lastSuccessfulUrl = this.backUrls.pop();
        return res;
    }

    public appendUrl(url: string) {
        this.lastSuccessfulUrl = url;
        this.backUrls.push(url);
    }

    public async attach(playerid: number) {
        this.playerId = playerid;
        await this.LoadActorId();
    }

    public async LoadActorId()
    {
        const player = await Player.GetById(this.playerId);
        const actor = await player.getActor();

        this.actorId = actor.id;
    }
}
