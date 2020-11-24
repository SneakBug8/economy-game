import { Factory } from "entity/Factory";
import { RecipesService, Recipe } from "./RecipesService";
import { Storage } from "entity/Storage";
import { Player } from "entity/Player";
import { EventsList } from "events/EventsList";
import { ProductionQueue } from "entity/ProductionQueue";
import { PlayerService } from "./PlayerService";
import { RGO } from "entity/RGO";
import { Logger } from "utility/Logger";

export class RGOGainService
{
    public static async Run(): Promise<void>
    {
        for (const rgo of await RGO.All()) {

            const player = await rgo.getOwner();
            const actor = await player.getActor();

            const type = await rgo.getType();

            if (!type) {
                continue;
            }

            const amountproduced = Math.round(rgo.employeesCount * type.efficiency);

            await Storage.AddGoodTo(rgo.marketId, actor.id, type.getGoodId(), amountproduced);

            PlayerService.SendOffline(player.id, `RGO ${rgo.id} gathered ${amountproduced} ${await (await type.getGood()).name}`);

            EventsList.onRGOGain.emit({
                RGO: rgo,
                Good: await type.getGood(),
                Amount: amountproduced,
            });
        }

        Logger.info("Ran RGO Gain service");
    }
}
