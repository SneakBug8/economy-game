import { Factory } from "entity/Factory";
import { RecipesService, Recipe } from "./RecipesService";
import { Storage } from "entity/Storage";
import { Player } from "entity/Player";
import { PlayerLog } from "entity/PlayerLog";
import { TurnsService } from "./TurnsService";
import { Turn } from "entity/Turn";

export class ProductionService
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            const recipe = RecipesService.GetById(factory.RecipeId);

            if (!recipe) {
                continue;
            }

            let reciperepeats = factory.employeesCount / recipe.employeesneeded;

            for (const input of recipe.Requisites) {
                const storageentry = await Storage.GetWithGoodAndFactory(factory, input.Good);

                if (!storageentry) {
                    break;
                }

                const hasresources = storageentry.amount;

                if (hasresources / input.amount < reciperepeats) {
                    reciperepeats = hasresources / input.amount;
                }
            }

            const player = await Player.GetWithFactory(factory.id);

            for (const input of recipe.Requisites) {
                await Storage.TakeGoodFrom(factory, input.Good, reciperepeats * input.amount);
            }

            for (const output of recipe.Results) {
                await Storage.AddGoodTo(factory, output.Good, reciperepeats * output.amount);
                PlayerLog.Log(player, Turn.CurrentTurn, "Produced " + reciperepeats * output.amount + " items");
                // Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
            }
        }
    }
}
