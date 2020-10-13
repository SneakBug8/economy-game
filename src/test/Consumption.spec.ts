import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { Consumption } from "entity/Consumption";

describe("ConsumptionTests", () =>
{
    it("Exists", async () =>
    {
         assert.ok(!await Consumption.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const consumption = await Consumption.GetById(1);

        assert.ok(consumption.id, "ID");
        assert.ok(consumption.market_id, "Market ID");
        assert.ok(consumption.good_id, "good");
        assert.ok(consumption.amount, "Amount");
        assert.ok(consumption.maxprice, "Max Price");

        assert.ok(consumption.Good, "Good");
        assert.ok(consumption.Market, "Market");
    });

    it("All", async () =>
    {
        const cons = await Consumption.All();

        assert.ok(cons.length, "count");
        assert.ok(cons[0].id, "ID");
    });
});
