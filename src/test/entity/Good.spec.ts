import * as assert from "assert";
import "mocha";
import { Good } from "entity/Good";

describe("GoodsTests", () =>
{

    it("Exists", async () =>
    {
        assert.ok(!await Good.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const good = await Good.GetById(1);

        assert.ok(good.id, "ID");
        assert.ok(good.name, "Name");
    });

    it("All", async () =>
    {
        const good = await Good.All();

        assert.ok(good.length, "count");
        assert.ok(good[0].id, "ID");
        assert.ok(good[0].name, "Name");
    });
});
