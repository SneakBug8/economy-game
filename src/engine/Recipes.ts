import { Recipe, RecipeEntry } from "./Production";
import { GoodRepository } from "entity/Good";

// tslint:disable: one-variable-per-declaration

let FirstToFirst;

(async () =>
{
    const firstgood = await GoodRepository.findOne(1);

    FirstToFirst = new Recipe(
        [
            new RecipeEntry(firstgood, 1)
        ],
        [
            new RecipeEntry(firstgood, 2)
        ]
    );
})();

export const Recipes = {
    1: FirstToFirst,
};
