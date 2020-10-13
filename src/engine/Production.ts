import { FactoryRepository, Factory } from "entity/Factory";
import { Good } from "entity/Good";
import { Recipes } from "./Recipes";
import { StorageRepository } from "entity/Storage";
import { Market } from "./Market";
import { PlayerRepository } from "entity/Player";

export class Production
{
    public static async Run(): Promise<void>
    {
        for (const factory of await FactoryRepository.find()) {
            const recipe = Recipes[factory.RecipeId] as Recipe;
            const player = await this.PlayerByFactory(factory);

            if (!recipe) {
                return;
            }

            let reciperepeats = factory.employeesCount / recipe.employeesneeded;

            for (const input of recipe.Requisites) {
                const storageentry = await StorageRepository.findOne({
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
                }
            }

            for (const input of recipe.Requisites) {
                const storageentry = await StorageRepository.findOne({
                    where: {
                        Factory: factory,
                        Good: input.Good
                    }
                });

                Market.RemoveFromStorage(player.Actor, input.Good, reciperepeats * input.amount);
            }

            for (const output of recipe.Results) {
                Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
            }
        }
    }

    public static async PlayerByFactory(factory: Factory)
    {
        return await PlayerRepository.findOne({
            where: {
                Factory: factory,
            },
        });
    }
}

export class Recipe
{
    public Requisites: RecipeEntry[];
    public employeesneeded: number = 1;
    public Results: RecipeEntry[];

    constructor(requisites?: RecipeEntry[], results?: RecipeEntry[], employeesneeded?: number)
    {
        if (requisites) {
            this.Requisites = requisites;
        }
        if (results) {
            this.Results = results;
        }
        if (employeesneeded) {
            this.employeesneeded = employeesneeded;
        }
    }
}

export class RecipeEntry
{
    public Good: Good;
    public amount: number;

    constructor(good?: Good, amount?: number)
    {
        if (good) {
            this.Good = good;
        }

        if (amount) {
            this.amount = amount;
        }
    }
}