import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { Production } from "entity/Production";

describe("ProductionTests", () =>
{
    it("Exists", async () =>
    {
         assert.ok(!await Production.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const production = await Production.GetById(1);

        assert.ok(production.id, "ID");
        assert.ok(production.market_id, "Market ID");
        assert.ok(production.good_id, "good");
        assert.ok(production.amount, "Amount");
        assert.ok(production.minprice, "Min Price");

        assert.ok(await production.getGood(), "Good");
        assert.ok(await production.getMarket(), "Market");
    });

    it("All", async () =>
    {
        const prods = await Production.All();

        assert.ok(prods.length, "count");
        assert.ok(prods[0].id, "ID");
    });
});