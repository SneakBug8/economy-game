import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { MarketActor } from "entity/MarketActor";

export class Users {
    public static async Register(username: string, passwd: string) {
        const player = new Player();
        player.cash = Config.RegistrationCash;
        player.username = username;
        player.password = passwd;

        const factory = new Factory();
        player.Factory = factory;
        await Factory.Insert(factory);

        const actor = new MarketActor();
        player.Actor = actor;
        await MarketActor.Insert(actor);

        await Player.Insert(player);
    }

    public static async Login(username: string, passwd: string): Promise<boolean> {
        const player = await Player.GetWithLogin(username);

        if (player.password === passwd) {
            return true;
        }

        return false;
    }
}