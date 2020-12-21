import { EventsList } from "events/EventsList";
import { Turn } from "entity/Turn";
import { StateActivityService } from "./StateActivityService";
import { Logger } from "utility/Logger";

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
            const playerid = await StateActivityService.GetPlayerId(keyvalue[0]);

            if (playerid) {
                await StateActivityService.CreateCash(playerid, keyvalue[1]);
            }
            else {
                Logger.error("Wrong GoldMine keyvalue " + JSON.stringify(keyvalue));
            }
        }
    }
}
