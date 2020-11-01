import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { MarketActor } from "entity/MarketActor";

export class UsersService {
    public static async Register(username: string, passwd: string) : Promise<number> {
        const player = new Player();
        player.cash = Config.RegistrationCash;
        player.username = username;
        player.password = passwd;

        const factory = new Factory();
        await Factory.Insert(factory);
        player.setFactory(factory);

        const actor = new MarketActor();
        await MarketActor.Insert(actor);
        player.setActor(actor);

        const id = await Player.Insert(player);

        return id;
    }

    public static async Login(username: string, passwd: string): Promise<Player> {
        const player = await Player.GetWithLogin(username);

        if (player && player.password === passwd) {
            return player;
        }

        return null;
    }
}