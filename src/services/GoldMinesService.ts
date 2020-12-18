import { EventsList } from "events/EventsList";
import { Turn } from "entity/Turn";
import { StateActivityService } from "./StateActivityService";

export class GoldMinesService
{

    public static Initialized = false;

    // MarketId to gold per turn
    public static readonly GoldMines: Map<number, number> = new Map([
        [1, 100],
        [2, 100],
    ]);

    public static async Init()
    {
        if (!GoldMinesService.Initialized) {
            EventsList.onAfterNewTurn.on(GoldMinesService.onAfterNewTurn);
            // EventsList.onBeforeNewTurn.on(async (t) => await StateActivityService.MakeStatistics(t));

            GoldMinesService.Initialized = true;
        }
    }

    public static async onAfterNewTurn()
    {
        for (const keyvalue of GoldMinesService.GoldMines) {
            const playerid = StateActivityService.PlayersMap[keyvalue[0]];
            await StateActivityService.CreateCash(playerid, keyvalue[1]);
        }
    }
}
