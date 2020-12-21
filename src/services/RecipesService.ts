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
        this.All = this.All.concat(await Recipe.All());

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
                entry.requisites += `<a href="/good/${good.id}">${input.Amount} ${good.name}</a>`;
            }
            else {
                entry.requisites += `<a href="/good/${good.id}">${input.Amount} ${good.name}</a>, `;
            }

            i++;
        }

        i = 0;

        for (const output of recipe.Results) {
            const good = await Good.GetById(output.GoodId);
            if (recipe.Results.length === 1 || i === recipe.Results.length - 1) {
                entry.results += `<a href="/good/${good.id}">${output.Amount} ${good.name}</a>`;
            }
            else {
                entry.results += `<a href="/good/${good.id}">${output.Amount} ${good.name}</a>, `;
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
        Recipe.Create(2, "Молоть пшеницу", [
            new RecipeEntry(GoodsList.Wheat, 2),
        ], [
            new RecipeEntry(GoodsList.Flour, 1),
        ]),
        Recipe.Create(3, "Печь хлеб", [
            new RecipeEntry(GoodsList.Flour, 2),
        ], [
            new RecipeEntry(GoodsList.Bread, 1),
        ]),
        Recipe.Create(4, "Ткать", [
            new RecipeEntry(GoodsList.Flax, 2),
        ], [
            new RecipeEntry(GoodsList.Cloth, 1),
        ]),
        Recipe.Create(5, "Шить одежду", [
            new RecipeEntry(GoodsList.Cloth, 2),
        ], [
            new RecipeEntry(GoodsList.Clothes, 1),
        ], 1, GoodsList.Instruments, 0.1),
        Recipe.Create(6, "Шить дорогую одежду", [
            new RecipeEntry(GoodsList.Cloth, 2),
            new RecipeEntry(GoodsList.Fur, 1),
        ], [
            new RecipeEntry(GoodsList.LuxuryClothes, 1),
        ], 1, GoodsList.Instruments, 0.1),
        Recipe.Create(7, "", [
            new RecipeEntry(GoodsList.IronOre, 2),
        ], [
            new RecipeEntry(GoodsList.Iron, 1),
        ]),
        Recipe.Create(8, "", [
            new RecipeEntry(GoodsList.GoldOre, 2),
        ], [
            new RecipeEntry(GoodsList.Gold, 1),
        ]),
        Recipe.Create(9, "", [
            new RecipeEntry(GoodsList.SilverOre, 2),
        ], [
            new RecipeEntry(GoodsList.Silver, 1),
        ]),
        Recipe.Create(10, "", [
            new RecipeEntry(GoodsList.Gems, 1),
            new RecipeEntry(GoodsList.Gold, 2),
            new RecipeEntry(GoodsList.Silver, 2),

        ], [
            new RecipeEntry(GoodsList.Jewelry, 1),
        ], 1, GoodsList.Instruments, 0.1),
        Recipe.Create(11, "", [
            new RecipeEntry(GoodsList.Iron, 2),

        ], [
            new RecipeEntry(GoodsList.Weapons, 1),
        ], 1, GoodsList.Instruments, 0.1),
        Recipe.Create(12, "", [
            new RecipeEntry(GoodsList.Iron, 3),

        ], [
            new RecipeEntry(GoodsList.Armor, 1),
        ], 1, GoodsList.Instruments, 0.1),
        Recipe.Create(13, "", [
            new RecipeEntry(GoodsList.Sulphur, 2),

        ], [
            new RecipeEntry(GoodsList.Fertilizer, 1),
        ]),
        Recipe.Create(14, "", [
            new RecipeEntry(GoodsList.Fish, 1),
            new RecipeEntry(GoodsList.Bread, 1),

        ], [
            new RecipeEntry(GoodsList.CheapFood, 1),
        ]),
        Recipe.Create(15, "", [
            new RecipeEntry(GoodsList.Cattle, 1),
            new RecipeEntry(GoodsList.Bread, 2),
        ], [
            new RecipeEntry(GoodsList.Food, 1),
        ]),
        Recipe.Create(16, "", [
            new RecipeEntry(GoodsList.Salt, 1),
            new RecipeEntry(GoodsList.Cattle, 1),
            new RecipeEntry(GoodsList.Bread, 3),

        ], [
            new RecipeEntry(GoodsList.LuxuryFood, 1),
        ]),
        Recipe.Create(17 , "", [
            new RecipeEntry(GoodsList.Stone, 2),

        ], [
            new RecipeEntry(GoodsList.StoneBlock, 1),
        ]),
        Recipe.Create(18 , "", [
            new RecipeEntry(GoodsList.Wheat, 2),
            new RecipeEntry(GoodsList.Glass, 1),
        ], [
            new RecipeEntry(GoodsList.Beer, 1),
        ], 1, GoodsList.Barrels, 0.1),
        Recipe.Create(19 , "", [
            new RecipeEntry(GoodsList.Fruits, 2),
            new RecipeEntry(GoodsList.Glass, 1),
        ], [
            new RecipeEntry(GoodsList.Wine, 1),
        ], 1, GoodsList.Barrels, 0.1),
        Recipe.Create(21 , "", [
            new RecipeEntry(GoodsList.Wood, 2),
        ], [
            new RecipeEntry(GoodsList.Lumber, 1),
        ]),
        Recipe.Create(22 , "", [
            new RecipeEntry(GoodsList.Lumber, 2),
        ], [
            new RecipeEntry(GoodsList.Furniture, 1),
        ]),
        Recipe.Create(23 , "", [
            new RecipeEntry(GoodsList.Lumber, 2),
            new RecipeEntry(GoodsList.Cloth, 1),
        ], [
            new RecipeEntry(GoodsList.LuxuryFurniture, 1),
        ]),
        Recipe.Create(24 , "", [
            new RecipeEntry(GoodsList.Lumber, 2),
        ], [
            new RecipeEntry(GoodsList.Barrels, 1),
        ]),
        Recipe.Create(25 , "", [
            new RecipeEntry(GoodsList.Lumber, 2),
            new RecipeEntry(GoodsList.Iron, 2),
        ], [
            new RecipeEntry(GoodsList.Instruments, 1),
        ])
    ];
}