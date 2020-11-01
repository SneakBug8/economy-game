import { Factory } from "entity/Factory";
import { RecipesService, Recipe } from "./RecipesService";
import { Storage } from "entity/Storage";
import { Player } from "entity/Player";
import { EventsList } from "events/EventsList";
import { ProductionQueue } from "entity/ProductionQueue";

export class ProductionService
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            const queue = await ProductionQueue.GetWithFactory(factory);

            if (!queue) {
                continue;
            }

            let remainingemployees = factory.employeesCount;
            for (let i = 0; i < queue.Queue.length; i++) {
                const queueentry = queue.Queue.shift();
                const recipe = RecipesService.GetById(queueentry.RecipeId);

                if (!recipe) {
                    continue;
                }

                let reciperepeats = Math.min(remainingemployees / recipe.employeesneeded, queueentry.Amount);

                if (reciperepeats < 1) {
                    break;
                }

                queueentry.Amount -= reciperepeats;

                if (queueentry.Amount !== 0) {
                    queue.Queue.unshift(queueentry);
                }

                ProductionQueue.Update(queue);

                // Check for resources
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

                if (reciperepeats < 1) {
                    break;
                }

                remainingemployees -= reciperepeats * recipe.employeesneeded;

                const player = await Player.GetWithFactory(factory);

                for (const input of recipe.Requisites) {
                    await Storage.TakeGoodFrom(factory, input.Good, reciperepeats * input.amount);
                }

                for (const output of recipe.Results) {
                    await Storage.AddGoodTo(factory, output.Good, reciperepeats * output.amount);

                    EventsList.onProduction.emit({
                        Factory: factory,
                        Good: output.Good,
                        Amount: reciperepeats * output.amount,
                    });
                    // Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
                }
            }
        }
    }
    /*
    Old. With one production recipe.
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

            const player = await Player.GetWithFactory(factory);

            for (const input of recipe.Requisites) {
                await Storage.TakeGoodFrom(factory, input.Good, reciperepeats * input.amount);
            }

            for (const output of recipe.Results) {
                await Storage.AddGoodTo(factory, output.Good, reciperepeats * output.amount);

                EventsList.onProduction.emit({
                    Factory: factory,
                    Good: output.Good,
                    Amount: reciperepeats * output.amount,
                });
                // Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
            }
        }
    }
    */
}
