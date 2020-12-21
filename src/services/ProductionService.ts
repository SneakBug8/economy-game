import { Factory } from "entity/Factory";
import { RecipesService } from "./RecipesService";
import { Storage } from "entity/Storage";
import { EventsList } from "events/EventsList";
import { ProductionQueue } from "entity/ProductionQueue";
import { PlayerService } from "./PlayerService";
import { Logger } from "utility/Logger";
import { Good } from "entity/Good";

export class ProductionService
{
    // TODO: Factory effectiveness growth over time when not changing recipes
    public static async Run()
    {
        for (const factory of await Factory.All()) {
            const queue = await ProductionQueue.GetWithFactory(factory);

            const r1 = await factory.getOwner();
            if (!r1.result) {
                return r1;
            }
            const player = r1.data;

            if (!queue) {
                continue;
            }

            let remainingemployees = factory.employeesCount;
            while (queue.Queue && queue.Queue.length && remainingemployees) {
                const queueentry = queue.Queue.shift();
                const recipe = await RecipesService.GetById(queueentry.RecipeId);

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
                    const storageentry = await Storage.GetWithGoodMarketAndPlayer(factory.marketId, player.id, input.GoodId);

                    if (!storageentry) {
                        break;
                    }

                    const hasresources = storageentry.amount;

                    if (hasresources / input.Amount < reciperepeats) {
                        reciperepeats = hasresources / input.Amount;
                    }
                }

                // Third try - repeats on instruments
                if (recipe.InstrumentGoodId != null) {
                    const instrumentshas = await Storage.Amount(factory.marketId, player.id, recipe.InstrumentGoodId);
                    if (instrumentshas < reciperepeats) {
                        reciperepeats = instrumentshas;
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
                    await Storage.TakeGoodFrom(factory.marketId, player.id, input.GoodId, reciperepeats * input.Amount);
                }

                // Break instruments
                const instumentsbroken = Math.round(recipe.InstrumentBreakChance * reciperepeats);
                await Storage.TakeGoodFrom(factory.marketId, player.id, recipe.InstrumentGoodId, instumentsbroken);

                // Give outputs
                for (const output of recipe.Results) {
                    await Storage.AddGoodTo(factory.marketId, player.id, output.GoodId, reciperepeats * output.Amount);

                    const good = await Good.GetById(output.GoodId);

                    await EventsList.onProduction.emit({
                        Factory: factory,
                        Good: good,
                        Amount: reciperepeats * output.Amount,
                    });
                    // Market.AddToStorage(player.Actor, output.Good, reciperepeats * output.amount);
                }
            }
        }

        Logger.info("Ran Production service");
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
