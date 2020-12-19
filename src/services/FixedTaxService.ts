import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import { Logger } from "utility/Logger";
import { RGO } from "entity/RGO";

export class FixedTaxService
{
    public static async Run(): Promise<void>
    {
        const players = await Player.All();

        for (const player of players) {
            // Fixed tax
            let cash = await player.AgetCash();
            if (cash > Config.FixedTax) {
                await player.payCashToState(player.CurrentMarketId, Config.FixedTax);
                PlayerService.SendOffline(player.id, `Paid ${Config.FixedTax} fixed tax.`);
            }
            else {
                // Take money up to zero instead of 99
                const amount = cash;
                await player.payCashToState(player.CurrentMarketId, amount);
                PlayerService.SendOffline(player.id, `Paid ${amount} only in fixed tax as can't pay in full.`);
            }

            // Per factory tax
            const factories = await player.getFactories();

            for (const factory of await factories) {
                // If player has only 1 factory - don't charge him of PerFactoryTax
                if (factories.length <= 1) {
                    break;
                }

                const perfactorytax = Config.TaxPerFactory;
                cash = await player.AgetCash();

                if (cash >= perfactorytax) {
                    await player.payCashToState(factory.marketId, perfactorytax);

                    PlayerService.SendOffline(player.id, `Paid ${perfactorytax} in per factory tax for ${factory.id}.`);
                }
                else {
                    // Take money up to zero insted of 99
                    const amount = cash;
                    await player.payCashToState(factory.marketId, amount);

                    if (factories[1]) {
                        PlayerService.SendOffline(player.id, `Paid ${amount} instead of ${perfactorytax} in per factory tax. ` +
                            `Factory ${factories[1].id} has been seized.`);

                        Factory.Delete(factories[1].id);
                    }
                    else {
                        Log.LogText("For whatever reason no factory[1] for fixedtaxservice");
                    }
                }
            }

            // Per RGO tax
            const rgos = await RGO.GetWithPlayer(player);

            for (const rgo of await rgos) {
                const perrgotax = Config.TaxPerRGO;
                cash = await player.AgetCash();

                if (cash >= perrgotax) {
                    await player.payCashToState(rgo.marketId, perrgotax);

                    PlayerService.SendOffline(player.id, `Paid ${perrgotax} in per RGO tax for ${rgo.id}.`);
                }
                else {
                    // Take money up to zero insted of 99
                    const amount = cash;
                    await player.payCashToState(rgo.marketId, amount);

                    if (rgos[1]) {
                        PlayerService.SendOffline(player.id, `Paid ${amount} instead of ${perrgotax} in per RGO tax. ` +
                            `RGO ${rgos[1].id} has been seized.`);

                        RGO.Delete(rgos[1].id);
                    }
                    else {
                        Log.LogText("For whatever reason no rgos[1] for fixedtaxservice");
                    }
                }
            }
        }

        Logger.info("Collected fixed taxes");
    }
}