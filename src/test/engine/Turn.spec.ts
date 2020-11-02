import "mocha";
import { Player } from "entity/Player";
import { UsersService } from "services/UsersService";
import assert = require("assert");
import { Runner } from "Runner";
import { ProductionQueue } from "entity/ProductionQueue";
import { Factory } from "entity/Factory";
import { Storage } from "entity/Storage";
import { RecipesService } from "services/RecipesService";
import { ProductionWatcher } from "watchers/ProductionWatcher";

describe("WholeTurn", () =>
{
    let playerid;
    it("Init", async () =>
    {
        await Runner.Init();

        playerid = await UsersService.Register("1", "1");
        const player = await Player.GetById(playerid);

        const actor = await player.getActor();
        const factory = (await player.getFactories())[0];

        // factory.RecipeId = RecipesService.FirstToFirst.id;
        await ProductionQueue.AddWithFactory(factory, {
            RecipeId: RecipesService.FirstToFirst.id,
            Amount: 10,
        });
        factory.employeesCount = 1;

        await Factory.Update(factory);

        await Storage.AddGoodTo(actor, RecipesService.firstgood, 10);
    });

    it("Turn", async () =>
    {
        await Runner.Turn();

        assert.ok(ProductionWatcher.GDP > 0, "GDP not zero");
    });

    it("Delete", async () =>
    {
        await Player.Delete(playerid);
    });
});
