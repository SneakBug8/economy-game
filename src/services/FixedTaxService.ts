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
                await player.payCashToState(Config.FixedTax);
                PlayerService.SendOffline(player.id, `Paid ${Config.FixedTax} fixed tax.`);
            }
            else {
                // Take money up to zero instead of 99
                const amount = player.cash;
                await player.payCashToState(amount);
                PlayerService.SendOffline(player.id, `Paid ${amount} only in fixed tax as can't pay in full.`);
            }

            const factories = await player.getFactories();

            // If player has only 1 factory - don't charge him of PerFactoryTax
            if (factories.length <= 1) {
                continue;
            }
            const perfactorytax = Config.TaxPerFactory * factories.length;

            if (player.cash > perfactorytax) {
                await player.payCashToState(perfactorytax);

                PlayerService.SendOffline(player.id, `Paid ${perfactorytax} in per factory tax.`);
            }
            else {
                // Take money up to zero insted of 99
                const amount = player.cash;
                await player.payCashToState(amount);

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

        Logger.info("Collected fixed taxes");
    }
}