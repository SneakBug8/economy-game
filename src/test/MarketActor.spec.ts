import * as assert from "assert";
import "mocha";
import { MarketActor } from "MarketActor";

describe("MarketActorTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(!await MarketActor.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const marketactor = await MarketActor.GetById(1);

        assert.ok(marketactor.id, "ID");
    });
});
