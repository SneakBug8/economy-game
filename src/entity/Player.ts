import { Factory, FactoryRepository } from "./Factory";
import { MarketActor } from "./MarketActor";
import { Connection } from "DataBase";
import { Log } from "./Log";
import { TurnsService } from "services/TurnsService";
import { RGO, RGORepository } from "./RGO";
import { Logger } from "utility/Logger";
import { StateActivityService } from "services/StateActivityService";

export class Player
{
    public id: number;
    public username: string;
    public password: string;
    public cash: number = 0;

    public CurrentMarketId: number;

    public actorId: number;
    public isAdmin: number = 0;
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
        res.actorId = dbobject.actorId;
        res.isAdmin = dbobject.isAdmin;
        res.CurrentMarketId = dbobject.CurrentMarketId;

        return res;
    }

    public getCash()
    {
        return this.cash;
    }

    public static async TransferCash(fromId: number, toId: number, amount: number)
    {
        if (fromId === toId) {
            return true;
        }

        const fromplayer = await Player.GetById(fromId);
        const toplayer = await Player.GetById(toId);

        if (!fromplayer || !toplayer) {
            return "No such player";
        }
        else if (fromplayer.cash < amount) {
            return Logger.warn(`Not enough money to make transfer`);
        }
        else if (amount < 0 && toplayer.cash < amount) {
            return `Not enough money to make transfer`;
        }

        await fromplayer.ModifyCash(-amount);
        await toplayer.ModifyCash(amount);

        return true;
    }

    public async payCash(to: Player, amount: number): Promise<boolean>
    {
        if (this.id === to.id || this.actorId === to.actorId) {
            return true;
        }
        else if (this.cash < amount) {
            Logger.warn(`[${this.username} Not enough money to make transfer to ${to.username}`);
            return false;
        }
        else if (amount < 0 && to.cash < amount) {
            Logger.warn(`[${this.username} Not enough money to make transfer to ${this.username}`);
            return false;
        }

        Logger.verbose(`${this.username} paid ${amount} to ${to.username}. Old balance: ${this.cash}`);

        await this.ModifyCash(-amount);
        await to.ModifyCash(amount);

        Logger.verbose(`New balance: ${to.cash}`);

        return true;
    }

    private async ModifyCash(amount: number)
    {
        this.cash += amount;
        const d = await Connection.raw("UPDATE Players set cash = cash + ? WHERE id = ?", [amount, this.id]);
        // const d = await PlayerRepository().where("id", this.id).update(Connection.raw("cash = cash + ?", amount));

        // player.id = d[0];

        // return d[0];
    }

    public async payCashToState(marketId: number, amount: number): Promise<boolean>
    {
        return await this.payCash(await StateActivityService.GetPlayer(marketId), amount);
    }

    public async takeCashFromState(marketId: number, amount: number): Promise<boolean>
    {
        return await this.payCash(await StateActivityService.GetPlayer(marketId), -amount);
    }

    public Verbose(): void
    {
        Log.LogTemp(`Player ${this.username} (${this.id}) with actor ${this.actorId}, cash: ${this.cash}`);
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

    // TODO: Get rid of
    public static async GetWithFactory(factory: Factory): Promise<Player>
    {
        return factory.getOwner();
    }

    public async getFactories(): Promise<Factory[]>
    {
        return Player.GetFactories(this);
    }

    public static async GetFactories(player: Player): Promise<Factory[]>
    {
        return this.GetFactoriesById(player.CurrentMarketId, player.id);
    }

    public static async GetCurrentMarketId(playerId: number)
    {
        const player = await Player.GetById(playerId);
        if (player) {
            return player.CurrentMarketId;
        }

        return null;
    }

    public static async GetFactoriesById(marketId: number, playerid: number): Promise<Factory[]>
    {
        const data = await FactoryRepository().select().where("playerId", playerid)
            .andWhere("marketId", marketId);

        const res = new Array<Factory>();

        if (data) {
            for (const entry of data) {
                res.push(await Factory.From(entry));
            }

            return res;
        }

        return [];
    }

    public async getFactoriesWorkers()
    {
        const factories = await Player.GetFactoriesById(this.CurrentMarketId, this.id);

        let res = 0;

        for (const factory of factories) {
            res += factory.employeesCount;
        }

        return res;
    }

    public async getRGOWorkers()
    {
        const rgos = await this.getRGOs();

        let res = 0;

        for (const rgo of rgos) {
            res += rgo.employeesCount;
        }

        return res;
    }

    public async getRGOs(): Promise<RGO[]>
    {
        return Player.GetRGOs(this);
    }

    public static async GetRGOs(player: Player): Promise<RGO[]>
    {
        return this.GetRGOsById(
            player.CurrentMarketId,
            player.id,
        );
    }

    public static async GetRGOsById(marketId: number, playerid: number): Promise<RGO[]>
    {
        const data = await RGORepository().select().where("playerId", playerid)
            .andWhere("marketId", marketId);

        const res = new Array<RGO>();

        if (data) {
            for (const entry of data) {
                res.push(await RGO.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async GetWithActor(actor: MarketActor): Promise<Player>
    {
        const data = await PlayerRepository().select().where("actorId", actor.id).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async GetWithActorId(actorId: number): Promise<Player>
    {
        const data = await PlayerRepository().select().where("actorId", actorId).first();

        if (data) {
            return this.From(data);
        }

        return null;
    }

    public static async Count(): Promise<number>
    {
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
            cash: player.getCash(),
            actorId: player.actorId,
            isAdmin: player.isAdmin,
            CurrentMarketId: player.CurrentMarketId,
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
            cash: player.getCash(),
            actorId: player.actorId,
            isAdmin: player.isAdmin,
            CurrentMarketId: player.CurrentMarketId,
        });

        player.id = d[0];

        Logger.info("Created player " + player.id);

        return d[0];
    }

    public static async Delete(id: number): Promise<boolean>
    {
        const player = await this.GetById(id);
        if (!player) {
            return false;
        }

        await player.payCashToState(player.CurrentMarketId, player.cash);

        if (player.getActor()) {
            MarketActor.Delete(player.actorId);
        }

        for (const factory of await Player.GetFactoriesById(player.CurrentMarketId, player.id)) {
            Factory.Delete(factory.id);
        }

        await PlayerRepository().delete().where("id", id);

        Log.LogText("Deleted player id " + id);

        return true;
    }

    public static async UseQuery(data: Player[])
    {
        const res = new Array<Player>();

        if (data) {
            for (const entry of data) {
                res.push(await this.From(entry));
            }

            return res;
        }

        return [];
    }

    public static async All(): Promise<Player[]>
    {
        const data = await PlayerRepository().select();
        return this.UseQuery(data);
    }

    public static async HasCash(id: number, amount: number): Promise<boolean>
    {
        const player = await Player.GetById(id);

        if (player.getCash() >= amount) {
            return true;
        }

        return false;
    }
}

export const PlayerRepository = () => Connection<Player>("Players");
