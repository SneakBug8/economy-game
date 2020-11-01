import { Factory } from "./Factory";
import { MarketActor } from "./MarketActor";
import { Connection } from "DataBase";
import { Log } from "./Log";

export class Player
{
    public id: number;
    public username: string;
    public password: string;
    public cash: number;
    public factoryId: number;

    public async getFactory(): Promise<Factory> {
        return Factory.GetById(this.factoryId);
    }
    public setFactory(factory: Factory) {
        this.factoryId = factory.id;
    }

    public actorId: number;
    public async getActor(): Promise<MarketActor>
    {
        return MarketActor.GetById(this.actorId);
    }
    public setActor(actor: MarketActor)
    {
        this.actorId = actor.id;
    }

    public static async From(dbobject: any)
    {
        const res = new Player();
        res.id = dbobject.id;
        res.username = dbobject.username;
        res.password = dbobject.password;
        res.cash = dbobject.cash;
        res.factoryId = dbobject.factoryId;
        res.actorId = dbobject.actorId;

        return res;
    }

    public Verbose(): void {
        Log.LogTemp(`Player ${this.id} with factory ${this.factoryId} and actor ${this.actorId}, cash: ${this.cash}`);
    }

    public static async GetById(id: number): Promise<Player>
    {
        const data = await PlayerRepository().select().where("id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithLogin(login: string): Promise<Player>
    {
        const data = await PlayerRepository().select().where("username", login).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithFactory(factory: Factory): Promise<Player>
    {
        const data = await PlayerRepository().select().where("factoryId", factory.id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithActor(actor: MarketActor): Promise<Player>
    {
        const data = await PlayerRepository().select().where("actorId", actor.id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number> {
        const data = await PlayerRepository().count("id as c").first() as any;

        if (data) {
            return data.c;
        }

        return null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        const res = await PlayerRepository().count("id as c").where("id", id).first() as any;

        return res.c > 0;
    }

    public static async Update(player: Player): Promise<number>
    {
        const d = await PlayerRepository().where("id", player.id).update({
            username: player.username,
            password: player.password,
            cash: player.cash,
            factoryId: player.factoryId,
            actorId: player.actorId,
        });

        player.id = d[0];

        return d[0];
    }


    public static async Insert(player: Player): Promise<number>
    {
        const d = await PlayerRepository().insert({
            id: player.id,
            username: player.username,
            password: player.password,
            cash: player.cash,
            factoryId: player.factoryId,
            actorId: player.actorId,
        });

        player.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const player = await this.GetById(id);
        await PlayerRepository().delete().where("id", id);

        if (player) {
            Factory.Delete(player.factoryId);
            MarketActor.Delete(player.actorId);
        }

        return true;
    }

    public static async All(): Promise<Player[]> {
        const data = await PlayerRepository().select();
        const res = new Array<Player>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async HasCash(id: number, amount: number): Promise<boolean> {
        const player = await Player.GetById(id);

        if (player.cash >= amount) {
            return true;
        }

        return false;
    }
}

export const PlayerRepository = () => Connection<Player>("Players");
