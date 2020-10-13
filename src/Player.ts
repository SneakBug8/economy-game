import { getAsync, runAsync } from "DB";
import { Factory } from "Factory";
import { MarketActor } from "MarketActor";

export class Player
{
    public id: number;
    public username: string;
    public password: string;
    public factory_id: number;
    public actor_id: number;
    public cash: number;

    public Factory: Factory;
    public Actor: MarketActor;

    static Players: { [id: number]: Player; } = {};

    public static async From(dbobject: any)
    {
        const res = new Player();
        res.id = dbobject.id;
        res.username = dbobject.username;
        res.password = dbobject.password;
        res.factory_id = dbobject.password;
        res.actor_id = dbobject.actor_id;
        res.cash = dbobject.cash;

        await res.LoadDependencies();

        return res;
    }

    public async LoadDependencies()
    {
        this.Factory = await Factory.GetById(this.factory_id);
        this.Actor = await MarketActor.GetById(this.actor_id);
    }

    public static async GetById(id: number): Promise<Player>
    {
        if (this.Players[id]) {
            return this.Players[id];
        }

        const data = await getAsync("select * from Players where id = ?", id);

        /*Connection.get("select * from BuyOffers where id = ?", id, (err, data) => {
            console.log(data);
        });*/

        this.Players[id] = await Player.From(data);

        return this.Players[id];
    }

    public Save(): void
    {
        runAsync("UPDATE TOP 1 in Players WHERE id = ? SET username = ?, password = ?, factory_id = ?, actor_id = ?, cash = ?", [
            this.id,
            this.username,
            this.password,
            this.factory_id,
            this.actor_id,
            this.cash,
        ]);
    }

    public static async Add(login: string, password: string, factory_id: number, actor_id: number, cash: number): Promise<number>
    {
        await runAsync(`insert into Players(username, password, factory_id, actor_id, cash)
        values(?, ?, ?, ?, ?);`,
            [login, password, factory_id, actor_id, cash]);

        const res = await getAsync("SELECT last_insert_rowid() as id", []);

        return res.id;
    }

    public static async Delete(id: number)
    {
        await runAsync("delete from Players where id = ?", id);

        Player.Players[id] = null;
    }

    public static async Exists(id: number): Promise<boolean>
    {
        if (this.Players[id]) {
            return true;
        }

        const data = await getAsync("select count(id) as c from Players where id = ?", id);

        return data.c > 0;
    }
}