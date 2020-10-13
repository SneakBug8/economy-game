import { FactoryRepository, Factory } from "entity/Factory";
import { Good } from "entity/Good";
import { Recipes, Recipe } from "./Recipes";
import { StorageRepository } from "entity/Storage";
import { Player } from "entity/Player";
import { Market } from "./Market";

export class Production
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            const recipe = Recipes[factory.RecipeId] as Recipe;
            const player = await Player.GetWithFactory(factory.id);

            if (!recipe) {
                return;
            }

            let reciperepeats = factory.employeesCount / recipe.employeesneeded;

            for (const input of recipe.Requisites) {
                /*const storageentry = await StorageRepository.findOne({
                    where: {
                        Factory: factory,
                        Good: input.Good
                    }
                });

                if (!storageentry) {
                    break;
                }

                const hasresources = storageentry.amount;

                if (hasresources / input.amount < reciperepeats) {
                    reciperepeats = hasresources / input.amount;
                }*/
            }

            for (const input of recipe.Requisites) {
                /*const storageentry = await StorageRepository.findOne({
                    where: {
                        Factory: factory,
                        Good: input.Good
                    }
                });*/

                Market.RemoveFromStorage(player.Actor, input.Good, reciperepeats * input.amount);
            }

            for (const output of recipe.Results) {
                Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
            }
        }
    }
}
