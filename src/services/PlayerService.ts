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

export class PlayerService
{
    public static async Register(username: string, passwd: string): Promise<number>
    {
        const player = new Player();

        player.CurrentMarketId = Market.DefaultMarket.id;

        // TODO: Imagine another way of adding RegistrationCash
        /*player.cash = Config.RegistrationCash;
        await StateActivityService.AddCash(player.CurrentMarketId, -Config.RegistrationCash);*/

        player.username = username;
        player.password = passwd;

        const id = await Player.Insert(player);

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
        Logger.info(`to ${playerId}: ${message}`);
        PlayerLog.Log(playerId, TurnsService.CurrentTurn, message);

        if (Runner.ApiProvider) {
            await Runner.ApiProvider.sendOffline(playerId, message);
        }
    }

    public static async Broadcast(message: string) {
        Logger.info(`Announcement: ${message}`);

        for (const player of await Player.All()) {
            await PlayerLog.Log(player.id, TurnsService.CurrentTurn, message);
        }

        if (Runner.ApiProvider) {
            await Runner.ApiProvider.broadcast(message);
        }
    }

    public static async MoveBetweenMarkets(playerId: number, marketId: number) {
        const player = await Player.GetById(playerId);
        const market = await Market.GetById(marketId);

        if (!market) {
            return "No such market";
        }

        if (!player) {
            return "No such player";
        }

        player.CurrentMarketId = market.id;

        Player.Update(player);

        return true;
    }
}