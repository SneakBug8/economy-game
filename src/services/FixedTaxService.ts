import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import { Logger } from "utility/Logger";

export class FixedTaxService
{
    public static async Run(): Promise<void>
    {
        const players = await Player.All();

        for (const player of players) {
            if (player.cash > Config.FixedTax) {
                await player.payCashToState(player.CurrentMarketId, Config.FixedTax);
                PlayerService.SendOffline(player.id, `Paid ${Config.FixedTax} fixed tax.`);
            }
            else {
                // Take money up to zero instead of 99
                const amount = player.cash;
                await player.payCashToState(player.CurrentMarketId, amount);
                PlayerService.SendOffline(player.id, `Paid ${amount} only in fixed tax as can't pay in full.`);
            }

            const factories = await player.getFactories();

            // If player has only 1 factory - don't charge him of PerFactoryTax
            if (factories.length <= 1) {
                continue;
            }

            for (const factory of await Factory.All()) {
                const perfactorytax = Config.TaxPerFactory;

                if (player.cash > perfactorytax) {
                    await player.payCashToState(factory.marketId, perfactorytax);

                    PlayerService.SendOffline(player.id, `Paid ${perfactorytax} in per factory tax for ${factory.id}.`);
                }
                else {
                    // Take money up to zero insted of 99
                    const amount = player.cash;
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
        }

        Logger.info("Collected fixed taxes");
    }
}