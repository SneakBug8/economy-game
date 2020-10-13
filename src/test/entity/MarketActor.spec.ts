import * as assert from "assert";
import "mocha";
import { MarketActor, MarketActorRepository } from "entity/MarketActor";

let lastid = 1;

describe("MarketActorTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(!await MarketActor.Exists(999), "Exists function works properly");
    });

    it("Add", async () =>
    {
        const actor = new MarketActor();

        const res = await MarketActor.Insert(actor);

        assert.ok(res, "Insert res id");

        lastid = res;
    });

    it("GetByID", async () =>
    {
        const marketactor = await MarketActor.GetById(lastid);

        assert.ok(marketactor.id, "ID");
    });

    it("Delete", async () =>
    {
        await MarketActor.Delete(lastid);

        const res = await MarketActor.Exists(lastid);
        assert.ok(!res, "Deleted actor");
    });
});
