import { Factory } from "entity/Factory";
import { RecipesService, Recipe } from "./RecipesService";
import { Storage } from "entity/Storage";
import { Player } from "entity/Player";
import { EventsList } from "events/EventsList";
import { ProductionQueue } from "entity/ProductionQueue";
import { PlayerService } from "./PlayerService";

export class ProductionService
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            const queue = await ProductionQueue.GetWithFactory(factory);

            const player = await factory.getOwner();
            const actor = await player.getActor();

            if (!queue) {
                continue;
            }

            let remainingemployees = factory.employeesCount;
            while (queue.Queue && queue.Queue.length && remainingemployees) {
                const queueentry = queue.Queue.shift();
                const recipe = RecipesService.GetById(queueentry.RecipeId);

                if (!recipe) {
                    continue;
                }

                // First try - base repeats on workers
                let reciperepeats = Math.min(remainingemployees / recipe.employeesneeded, queueentry.Amount);

                if (reciperepeats < 1) {
                    PlayerService.SendOffline(player.id, "Not enough workers to produce recipe");
                    break;
                }

                // Second try - repeats on resources
                for (const input of recipe.Requisites) {
                    const storageentry = await Storage.GetWithGoodAndActor(actor.id, input.Good.id);

                    if (!storageentry) {
                        break;
                    }

                    const hasresources = storageentry.amount;

                    if (hasresources / input.amount < reciperepeats) {
                        reciperepeats = hasresources / input.amount;
                    }
                }

                if (reciperepeats < 1) {
                    PlayerService.SendOffline(player.id, "Not enough resources to produce recipe");
                    break;
                }

                queueentry.Amount -= reciperepeats;

                // if has more in queue entry - return it to queue
                if (queueentry.Amount !== 0) {
                    queue.Queue.unshift(queueentry);
                }
                await ProductionQueue.Update(queue);

                remainingemployees -= reciperepeats * recipe.employeesneeded;

                // Take inputs
                for (const input of recipe.Requisites) {
                    await Storage.TakeGoodFrom(actor, input.Good, reciperepeats * input.amount);
                }

                // Give outputs
                for (const output of recipe.Results) {
                    await Storage.AddGoodTo(actor.id, output.Good.id, reciperepeats * output.amount);

                    PlayerService.SendOffline(player.id, `Manufactured ${reciperepeats * output.amount} ${output.Good.name}`);

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
