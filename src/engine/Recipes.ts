import { Recipe, RecipeEntry } from "./Production";

// tslint:disable: one-variable-per-declaration

let FirstToFirst;

(async () =>
{
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
