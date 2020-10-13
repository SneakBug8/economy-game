import { Factory } from "entity/Factory";
import { Recipes, Recipe } from "./Recipes";
import { Storage } from "entity/Storage";
import { Player } from "entity/Player";

export class Production
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            const recipe = Recipes.GetById(factory.RecipeId);

            if (!recipe) {
                return;
            }

            console.log("Found recipe");

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

            console.log(reciperepeats);

            for (const input of recipe.Requisites) {
                await Storage.TakeGoodFrom(factory, input.Good, reciperepeats * input.amount);
            }

            for (const output of recipe.Results) {
                await Storage.AddGoodTo(factory, output.Good, reciperepeats * output.amount);
                // Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
            }
        }
    }
}
