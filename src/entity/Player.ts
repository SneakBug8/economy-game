import { Factory } from "./Factory";
import { MarketActor } from "./MarketActor";
import { Connection } from "DataBase";

export class Player
{
    public id: number;
    public username: string;
    public password: string;
    public cash: number;
    public factory_id: number;
    public Factory: Factory;
    public actor_id: number;
    public Actor: MarketActor;

    public static async From(dbobject: any)
    {
        const res = new Player();
        res.id = dbobject.id;
        res.username = dbobject.username;
        res.password = dbobject.password;
        res.cash = dbobject.cash;
        res.factory_id = dbobject.factory_id;
        res.actor_id = dbobject.actor_id;

        if (res.factory_id) {
            res.Factory = await Factory.GetById(res.factory_id);
        }
        if (res.actor_id) {
            res.Actor = await MarketActor.GetById(res.actor_id);
        }

        return res;
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

    public static async GetWithFactory(id: number): Promise<Player>
    {
        const data = await PlayerRepository().select().where("factory_id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithActor(id: number): Promise<Player>
    {
        const data = await PlayerRepository().select().where("actor_id", id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number> {
        const data = await PlayerRepository().count("id as c").first() as any;

        console.log(data);

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
            factory_id: player.Factory.id || player.factory_id,
            actor_id: player.Actor.id || player.actor_id,
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
            factory_id: player.Factory.id || player.factory_id,
            actor_id: player.Actor.id || player.actor_id,
        });

        player.id = d[0];

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const player = await this.GetById(id);
        await PlayerRepository().delete().where("id", id);

        if (player) {
            Factory.Delete(player.factory_id);
            MarketActor.Delete(player.actor_id);
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
}

export const PlayerRepository = () => Connection<Player>("Players");