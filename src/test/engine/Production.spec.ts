import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { RecipesService } from "services/RecipesService";
import { Player } from "entity/Player";
import { UsersService } from "services/UsersService";
import { ProductionService } from "services/ProductionService";
import { Storage } from "entity/Storage";
import { Runner } from "Runner";

describe("ProductionEngine", () =>
{

    it("Produces", async () =>
    {
        Runner.Init();

        const newplayerid = await UsersService.Register("1", "1");
        const player = await Player.GetById(newplayerid);

        const factory = await player.getFactory();
        const actor = await player.getActor();

        factory.RecipeId = RecipesService.FirstToFirst.id;
        factory.employeesCount = 1;

        Factory.Update(factory);

        await Storage.AddGoodTo(factory, RecipesService.firstgood, 10);

        await ProductionService.Run();

        assert.ok(await Storage.Has(factory, RecipesService.firstgood, 11), "Produced 2 goods");
    });
});
