import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { RecipesService } from "services/RecipesService";
import { Player } from "entity/Player";
import { PlayerService } from "services/PlayerService";
import { ProductionService } from "services/ProductionService";
import { Storage } from "entity/Storage";
import { Runner } from "Runner";
import { ProductionQueue } from "entity/ProductionQueue";

describe("ProductionEngine", () =>
{

    it("Produces", async () =>
    {
        Runner.Init();

        const newplayerid = await PlayerService.Register("1", "1");
        const player = await Player.GetById(newplayerid);

        const actor = await player.getActor();
        const factory = (await player.getFactories())[0];

        // factory.RecipeId = RecipesService.FirstToFirst.id;
        await ProductionQueue.AddWithFactory(factory, {
            RecipeId: RecipesService.FirstToFirst.id,
            Amount: 10,
        });
        factory.employeesCount = 1;

        await Factory.Update(factory);

        await Storage.AddGoodTo(actor.id, RecipesService.firstgood.id, 10);

        await ProductionService.Run();

        assert.ok(await Storage.Has(actor, RecipesService.firstgood, 11), "Produced 2 goods");

        await Player.Delete(newplayerid);
    });
});
