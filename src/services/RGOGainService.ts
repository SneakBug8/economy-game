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

            const type = await rgo.getType();

            if (!type) {
                continue;
            }

            // First try - employees
            let repeats = rgo.employeesCount;

            // Second try - repeats on instruments
            if (type.InstrumentGoodId != null) {
                const instrumentshas = await Storage.Amount(rgo.marketId, player.id, type.InstrumentGoodId);
                if (instrumentshas < repeats) {
                    repeats = instrumentshas;
                }
            }

            // Break instruments
            const instumentsbroken = Math.round(type.InstrumentBreakChance * repeats);
            await Storage.TakeGoodFrom(rgo.marketId, player.id, type.InstrumentGoodId, instumentsbroken);

            const amountproduced = Math.round(repeats * type.efficiency);
            await Storage.AddGoodTo(rgo.marketId, player.id, type.getGoodId(), amountproduced);

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
