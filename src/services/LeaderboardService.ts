import { Factory, FactoryRepository } from "entity/Factory";
import { Player, PlayerRepository } from "entity/Player";
import { RGORepository } from "entity/RGO";

export class LeaderboardService {
    public static async GetRichestPlayers() {
        let data = await Player.GetRichest();
        data = data.filter((x) => Player.IsPlayable(x.player.id));

        return data;
    }

    public static async GetMostFactoryWorkers() {
        const data = await FactoryRepository().select("playerId").sum("employees_count as c").groupBy("playerId").orderBy("c", "desc");
        return data;
    }

    public static async GetMostRGOWorkers() {
        const data = await RGORepository().select("playerId").sum("employeesCount as c").groupBy("playerId").orderBy("c", "desc");
        return data;
    }
}