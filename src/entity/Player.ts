import { Factory, FactoryRepository } from "./Factory";
import { Connection } from "DataBase";
import { Log } from "./Log";
import { RGO, RGORepository } from "./RGO";
import { Logger } from "utility/Logger";
import { StateActivityService } from "services/StateActivityService";
import { Storage, StorageRepository } from "./Storage";
import { Config } from "config";
import { Market } from "./Market";
import { PopulationActivityService } from "services/PopulationActivityService";
import { Requisite } from "services/Requisites/Requisite";

export class Player
{
    public id: number;
    public username: string;
    public password: string;

    public CurrentMarketId: number;

    public isAdmin: number = 0;

    public static async From(dbobject: any)
    {
        const res = new Player();
        res.id = dbobject.id;
        res.username = dbobject.username;
        res.password = dbobject.password;
        res.isAdmin = dbobject.isAdmin;
        res.CurrentMarketId = dbobject.CurrentMarketId;

        return res;
    }

    public async AgetCash()
    {
        return await this.getCashMarket(this.CurrentMarketId);
    }

    public async getCash(goodId: number, marketId: number = this.CurrentMarketId)
    {
        return await Storage.Amount(marketId, this.id, goodId);
    }

    public async getCashMarket(marketId: number)
    {
        const market = await Market.GetById(marketId);

        if (!market) {
            Logger.verbose(`No cash at ${marketId}`);
        }

        return await Storage.Amount(marketId, this.id, await market.getCashGoodId());
    }

    public async getGold()
    {
        return await Storage.Amount(this.CurrentMarketId, this.id, Config.GoldGoodId);
    }

    public static async TransferCash(fromId: number, toId: number, amount: number)
    {
        if (fromId === toId) {
            return new Requisite().success();
        }

        const fromplayer = await Player.GetById(fromId);
        const toplayer = await Player.GetById(toId);

        if (!fromplayer.result) {
            return fromplayer;
        }
        if (!toplayer.result) {
            return toplayer;
        }

        else if (await fromplayer.data.AgetCash() < amount) {
            return new Requisite().error(`Not enough money to make transfer`);
        }
        else if (amount < 0 && await toplayer.data.AgetCash() < amount) {
            return new Requisite().error(`Not enough money to make transfer`);
        }

        const r1 = await fromplayer.data.modifyCash(fromplayer.data.CurrentMarketId, -amount);
        const r2 = await toplayer.data.modifyCash(fromplayer.data.CurrentMarketId, amount);

        if (!r1.result) {
            return r1;
        }
        if (!r2.result) {
            return r2;
        }

        return new Requisite().success();
    }

    public async payCash(to: Player, amount: number)
    {
        return await Player.TransferCash(this.id, to.id, amount);
    }

    private async modifyCash(marketId: number, amount: number)
    {
        return await Player.ModifyCash(this.id, marketId, amount);
    }

    private static async ModifyCash(playerId: number, marketId: number, amount: number)
    {
        // this.cash += amount;
        return await Storage.AddGoodTo(marketId, playerId, await Market.GetCashGoodId(marketId), amount);
        // const d = await Connection.raw("UPDATE Players set cash = cash + ? WHERE id = ?", [amount, this.id]);
        // const d = await PlayerRepository().where("id", this.id).update(Connection.raw("cash = cash + ?", amount));

        // player.id = d[0];

        // return d[0];
    }

    public async payCashToState(marketId: number, amount: number)
    {
        const r1 = await StateActivityService.GetPlayer(marketId);
        if (!r1.result) {
            return r1;
        }

        return await this.payCash(r1.data, amount);
    }

    public async takeCashFromState(marketId: number, amount: number)
    {
        const r1 = await StateActivityService.GetPlayer(marketId);
        if (!r1.result) {
            return r1;
        }
        return await this.payCash(r1.data, -amount);
    }

    public async Verbose()
    {
        Log.LogTemp(`Player ${this.username} (${this.id}), cash: ${await this.AgetCash()}`);
    }

    public static async GetById(id: number)
    {
        if (!id) {
            console.trace("GetById(null)");
            return new Requisite<Player>().error("GetById(null)");
        }

        const data = await PlayerRepository().select().where("id", id).first();

        if (data) {
            return new Requisite<Player>().success(await this.From(data));
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
    public static async GetWithFactory(factory: Factory)
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

        if (!player.result) {
            return player.to<number>();
        }

        return new Requisite<number>().success(player.data.CurrentMarketId);
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

    public static async Update(player: Player)
    {
        await PlayerRepository().where("id", player.id).update({
            username: player.username,
            password: player.password,
            isAdmin: player.isAdmin,
            CurrentMarketId: player.CurrentMarketId,
        });
    }

    public static async Insert(player: Player): Promise<number>
    {
        const d = await PlayerRepository().insert({
            id: player.id,
            username: player.username,
            password: player.password,
            isAdmin: player.isAdmin,
            CurrentMarketId: player.CurrentMarketId,
        });

        player.id = d[0];

        Logger.info("Created player " + player.id);

        return d[0];
    }

    public static async Delete(id: number)
    {
        const pcheck = await this.GetById(id);
        if (!pcheck.result) {
            return pcheck;
        }

        const player = pcheck.data;

        // TODO: make sure all types of cashes everywhere is properly transfered to govt
        const r1 = await player.payCashToState(player.CurrentMarketId, await player.AgetCash());

        if (!r1.result) {
            return r1;
        }

        for (const factory of await Player.GetFactoriesById(player.CurrentMarketId, player.id)) {
            await Factory.Delete(factory.id);
        }

        await PlayerRepository().delete().where("id", id);

        Log.LogText("Deleted player id " + id);
        return new Requisite().success();
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

    public static async HasCash(id: number, amount: number)
    {
        const pcheck = await Player.GetById(id);

        if (!pcheck.result) {
            return new Requisite<boolean>().error(pcheck.message);
        }

        const player = pcheck.data;
        if (await player.AgetCash() >= amount) {
            return new Requisite(true);
        }

        return new Requisite(false);
    }

    public static async IsPlayable(playerId: number) {
        for (const i of await StateActivityService.GetPlayerIds()) {
            if (playerId === i) {
                return false;
            }
        }

        for (const i of await PopulationActivityService.GetPlayerIds()) {
            if (playerId === i) {
                return false;
            }
        }

        return true;
    }

    public static async GetRichest() {
        const biggestgoldpiles = await StorageRepository()
        .where("goodId", 1)
        .groupBy("playerId")
        .sum("amount as amount")
        .select("playerId")
        .orderBy("amount", "desc") as any;

        const res: Array<{player: Player, amount: number}> = [];

        for (const stock of biggestgoldpiles) {
            const player = await Player.GetById(stock.playerId);

            if (!player.result) {
                Logger.warn(player.toString());
                continue;
            }

            res.push({
                player: player.data,
                amount: stock.amount,
            });
        }

        return res;
    }
}

export const PlayerRepository = () => Connection<Player>("Players");
