import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { Recipes } from "engine/Recipes";
import { Player } from "entity/Player";
import { Users } from "engine/Users";
import { Production } from "engine/Production";
import { Storage } from "entity/Storage";
import { Runner } from "Runner";

describe("ProductionEngine", () =>
{

    it("Produces", async () =>
    {
        const newplayerid = await Users.Register("1", "1");
        const player = await Player.GetById(newplayerid);

        const factory = player.Factory;
        const actor = player.Actor;

        Runner.Init();

        factory.RecipeId = Recipes.FirstToFirst.id;
        factory.employeesCount = 1;

        Factory.Update(factory);

        await Storage.AddGoodTo(factory, Recipes.firstgood, 10);

        await Production.Run();

        assert.ok(await Storage.Has(factory, Recipes.firstgood, 11), "Produced 2 goods");
    });
});
