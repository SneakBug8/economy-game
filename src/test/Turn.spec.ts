import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { Turn } from "entity/Turn";

let lastid = 1;

describe("TurnsTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(!await Turn.Exists(999), "Exists function works properly");
    });

    /*

    it("Add", async () =>
    {
        const res = await Turn.Add(1, 1, 1);

        assert.ok(res, "Insert res");
        assert.ok(res.id, "Last id res");

        lastid = res.id;
    });

    */

    it("GetByid", async () =>
    {
        const res = await Turn.GetById(lastid);

        assert.ok(res, "Select");
        assert.ok(res.id, "Last id res");
        assert.ok(res.totalcash, "totalcash");
        assert.ok(res.cashperplayer, "cashperplayer");
        assert.ok(res.freecash, "freecash");
    });

    /*

    it("Delete", async () =>
    {
        await Turn.Delete(lastid);

        const res = await Turn.GetById(lastid);
        assert.ok(!res, "Deleted turn");
    });
    */
});