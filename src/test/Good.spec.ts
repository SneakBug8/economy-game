import * as assert from "assert";
import "mocha";
import { Good } from "Good";

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
        assert.ok(good.name, "ID");
    });
});
