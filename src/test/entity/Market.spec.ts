import * as assert from "assert";
import "mocha";
import { Market } from "entity/Market";

describe("MarketTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(!await Market.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const market = await Market.GetById(1);

        assert.ok(market.id, "ID");
    });

    it("All", async () =>
    {
        const markets = await Market.All();

        assert.ok(markets.length, "count");
        assert.ok(markets[0].id, "ID");
    });
});
