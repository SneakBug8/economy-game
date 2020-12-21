import { Storage } from "entity/Storage";
import { EventsList } from "events/EventsList";
import { PlayerService } from "./PlayerService";
import { RGO } from "entity/RGO";
import { Logger } from "utility/Logger";
import { RGOMarketToType } from "entity/RGOMarketToType";
import { RGOService } from "./RGOService";
import { RecipeEntry } from "entity/Recipe";
import { Dice } from "utility/Dice";

export class RGOGainService
{
    public static async Run(): Promise<void>
    {
        for (const rgo of await RGO.All()) {

            const r1 = await rgo.getOwner();
            if (!r1.result) {
                Logger.warn(r1.toString());
                continue;
            }
            const player = r1.data;

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
            const instumentsbroken = Dice.Multiple(repeats, type.InstrumentBreakChance);
            await Storage.TakeGoodFrom(rgo.marketId, player.id, type.InstrumentGoodId, instumentsbroken);

            const link = await RGOMarketToType.GetMarketTypeLink(rgo.marketId, rgo.typeId);

            const efficiency = RGOService.CalculateEfficiency(type, link);

            const amountproduced = Math.round(repeats * efficiency);

            for (const output of type.Produces) {
                await Storage.AddGoodTo(rgo.marketId, player.id, output.GoodId, amountproduced * output.Amount);
            }

            PlayerService.SendOffline(player.id, `RGO ${rgo.id} gathered ${amountproduced} packs of ${await RecipeEntry.toString(type.Produces)}`);

            /*await EventsList.onRGOGain.emit({
                RGO: rgo,
                Good: await type.getGood(),
                Amount: amountproduced,
            });*/
        }

        Logger.info("Ran RGO Gain service");
    }
}
