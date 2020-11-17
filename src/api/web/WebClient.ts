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
