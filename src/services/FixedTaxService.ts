import { Player } from "entity/Player";
import { Config } from "config";

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
        }
    }
}