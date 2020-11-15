import { Player } from "entity/Player";
import { Config } from "config";
import { Factory } from "entity/Factory";
import { Log } from "entity/Log";

export class FixedTaxService
{
    public static async Run(): Promise<void>
    {
        const players = await Player.All();

        for (const player of players) {
            if (player.cash > Config.FixedTax) {
                player.payCashToState(Config.FixedTax);
            }
            else {
                // Take money up to zero insted of 99
                const amount = player.cash;
                player.payCashToState(amount);
            }

            const factories = await player.getFactories();
            if (factories.length <= 1) {
                return;
            }
            const perfactorytax = Config.TaxPerFactory * factories.length;

            if (player.cash > perfactorytax) {
                player.payCashToState(perfactorytax);
            }
            else {
                // Take money up to zero insted of 99
                const amount = player.cash;
                player.payCashToState(amount);

                if (factories[1]) {
                    Factory.Delete(factories[1].id);
                }
                else {
                    Log.LogText("For whatever reason no factory[1] for fixedtaxservice");
                }
            }
        }
    }
}