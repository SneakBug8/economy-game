import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { MarketActor } from "entity/MarketActor";
import { TurnsService } from "./TurnsService";
import { Runner } from "Runner";
import { Logger } from "utility/Logger";
import { PlayerLog } from "entity/PlayerLog";
import { Turn } from "entity/Turn";

export class PlayerService
{
    public static async Register(username: string, passwd: string): Promise<number>
    {
        const player = new Player();

        player.cash = Config.RegistrationCash;
        TurnsService.AddFreeCash(-Config.RegistrationCash);

        player.username = username;
        player.password = passwd;

        const actor = new MarketActor();
        await MarketActor.Insert(actor);
        player.setActor(actor);

        const id = await Player.Insert(player);

        // TODO: Set default workers and salary
        const factoryid = await Factory.Create(player, 10, 1);

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
}