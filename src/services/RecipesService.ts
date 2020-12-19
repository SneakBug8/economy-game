import { timeStamp } from "console";
import { Good } from "entity/Good";
import { Log } from "entity/Log";
import { Recipe, RecipeEntry } from "entity/Recipe";
import { GoodsList } from "./GoodsList";

export class RecipesService
{
    public static firstgood: Good;

    public static async Init()
    {
        for (const rec of this.All) {
            await rec.Init();
        }

        Log.LogText("Recipes initialized");
    }

    public static GetById(id: number)
    {
        for (const recipe of this.All) {
            if (recipe.id === id) {
                return recipe;
            }
        }

        return null;
    }

    public static async PrepareToRender(recipe: Recipe) {
        const entry = {
            name: recipe.name || recipe.id,
            id: recipe.id,
            requisites: "",
            results: "",
            workers: recipe.employeesneeded,
            instrument: (recipe.InstrumentGoodId) ? await (await Good.GetById(recipe.InstrumentGoodId)).name : null,
            chance: recipe.InstrumentBreakChance * 100,
        };

        let i = 0;
        for (const input of recipe.Requisites) {
            const good = await Good.GetById(input.GoodId);

            if (recipe.Requisites.length === 1 || i === recipe.Requisites.length - 1) {
                entry.requisites += `<a href="/good/${good.id}">${input.amount} ${good.name}</a>`;
            }
            else {
                entry.requisites += `<a href="/good/${good.id}">${input.amount} ${good.name}</a>, `;
            }

            i++;
        }

        i = 0;

        for (const output of recipe.Results) {
            const good = await Good.GetById(output.GoodId);
            if (recipe.Results.length === 1 || i === recipe.Results.length - 1) {
                entry.results += `<a href="/good/${good.id}">${output.amount} ${good.name}</a>`;
            }
            else {
                entry.results += `<a href="/good/${good.id}">${output.amount} ${good.name}</a>, `;
            }

            i++;
        }

        return entry;
    }

    public static GetWithGood(goodID: number)
    {
        const res: Recipe[] = [];

        loop1:
        for (const recipe of this.All) {
            for (const req of recipe.Requisites) {
                if (req.GoodId === goodID) {
                    res.push(recipe);
                    break loop1;
                }
            }
            for (const preres of recipe.Results) {
                if (preres.GoodId === goodID) {
                    res.push(recipe);
                    break loop1;
                }
            }
        }

        return res;
    }

    static All: Recipe[] = [
        new Recipe(2, "Молоть пшеницу", [
            new RecipeEntry(GoodsList.Wheat, 2),
        ], [
            new RecipeEntry(GoodsList.Flour, 1),
        ]),
        new Recipe(3, "Печь хлеб", [
            new RecipeEntry(GoodsList.Flour, 2),
        ], [
            new RecipeEntry(GoodsList.Bread, 1),
        ]),
        new Recipe(4, "Ткать", [
            new RecipeEntry(GoodsList.Flax, 2),
        ], [
            new RecipeEntry(GoodsList.Cloth, 1),
        ]),
        new Recipe(5, "Шить одежду", [
            new RecipeEntry(GoodsList.Cloth, 2),
        ], [
            new RecipeEntry(GoodsList.Clothes, 1),
        ]),
        new Recipe(6, "Шить дорогую одежду", [
            new RecipeEntry(GoodsList.Cloth, 2),
            new RecipeEntry(GoodsList.Fur, 1),
        ], [
            new RecipeEntry(GoodsList.LuxuryClothes, 1),
        ]),
        new Recipe(7, "", [
            new RecipeEntry(GoodsList.IronOre, 2),
        ], [
            new RecipeEntry(GoodsList.Iron, 1),
        ]),
        new Recipe(8, "", [
            new RecipeEntry(GoodsList.GoldOre, 2),
        ], [
            new RecipeEntry(GoodsList.Gold, 1),
        ]),
        new Recipe(9, "", [
            new RecipeEntry(GoodsList.SilverOre, 2),
        ], [
            new RecipeEntry(GoodsList.Silver, 1),
        ]),
        new Recipe(10, "", [
            new RecipeEntry(GoodsList.Gems, 1),
            new RecipeEntry(GoodsList.Gold, 2),
            new RecipeEntry(GoodsList.Silver, 2),

        ], [
            new RecipeEntry(GoodsList.Jewelry, 1),
        ]),
        new Recipe(11, "", [
            new RecipeEntry(GoodsList.Iron, 2),

        ], [
            new RecipeEntry(GoodsList.Weapons, 1),
        ]),
        new Recipe(12, "", [
            new RecipeEntry(GoodsList.Iron, 3),

        ], [
            new RecipeEntry(GoodsList.Armor, 1),
        ]),
        new Recipe(13, "", [
            new RecipeEntry(GoodsList.Sulphur, 2),

        ], [
            new RecipeEntry(GoodsList.Fertilizer, 1),
        ]),
        new Recipe(14, "", [
            new RecipeEntry(GoodsList.Fish, 1),
            new RecipeEntry(GoodsList.Bread, 1),

        ], [
            new RecipeEntry(GoodsList.CheapFood, 1),
        ]),
        new Recipe(15, "", [
            new RecipeEntry(GoodsList.Cattle, 1),
            new RecipeEntry(GoodsList.Bread, 2),
        ], [
            new RecipeEntry(GoodsList.Food, 1),
        ]),
        new Recipe(16, "", [
            new RecipeEntry(GoodsList.Salt, 1),
            new RecipeEntry(GoodsList.Cattle, 1),
            new RecipeEntry(GoodsList.Bread, 3),

        ], [
            new RecipeEntry(GoodsList.LuxuryFood, 1),
        ]),
        new Recipe(17 , "", [
            new RecipeEntry(GoodsList.Stone, 2),

        ], [
            new RecipeEntry(GoodsList.StoneBlock, 1),
        ])
    ];
}