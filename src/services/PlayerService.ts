import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { TurnsService } from "./TurnsService";
import { Runner } from "Runner";
import { Logger } from "utility/Logger";
import { PlayerLog } from "entity/PlayerLog";
import { Turn } from "entity/Turn";
import { StateActivityService } from "./StateActivityService";
import { Market } from "entity/Market";
import { PopulationActivityService } from "./PopulationActivityService";
import { Requisite } from "./Requisites/Requisite";
import { off } from "process";

export class PlayerService
{
    public static async Register(username: string, passwd: string): Promise<number>
    {
        const player = new Player();

        player.CurrentMarketId = Market.DefaultMarket.id;
        player.username = username;
        player.password = passwd;

        const id = await Player.Insert(player);

        await PopulationActivityService.TransferCash(player.CurrentMarketId, id, Config.RegistrationCash);

        // TODO: Set default workers and salary
        const factoryid = await Factory.Create(Market.DefaultMarket.id, player.id, 10, 1);

        return id;
    }

    public static async Login(username: string, passwd: string): Promise<Player>
    {
        const player = await Player.GetWithLogin(username);

        if (player && player.password === passwd) {
            return player;
        }

        return null;
    }

    public static async SendOffline(playerId: number, message: string) {
        Logger.verbose(`to ${playerId}: ${message}`);
        await PlayerLog.Log(playerId, TurnsService.CurrentTurn, message);

        if (Runner.ApiProvider) {
            await Runner.ApiProvider.sendOffline(playerId, message);
        }
    }

    public static async Broadcast(message: string, offline: boolean = false) {
        Logger.info(`Announcement: ${message}`);

        for (const player of await Player.All()) {
            await PlayerLog.Log(player.id, TurnsService.CurrentTurn, message);
        }

        if (Runner.ApiProvider && offline) {
            await Runner.ApiProvider.broadcast(message);
        }
    }

    public static async MoveBetweenMarkets(playerId: number, marketId: number) {
        const pcheck = await Player.GetById(playerId);
        const market = await Market.GetById(marketId);

        if (!market) {
            return "No such market";
        }

        if (!pcheck.result) {
            return pcheck;
        }

        const player = pcheck.data;

        player.CurrentMarketId = market.id;

        await Player.Update(player);
        return new Requisite().success();
    }
}