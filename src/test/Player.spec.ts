import * as assert from "assert";
import "mocha";
import { Player } from "Player";

let lastid = 0;

describe("PlayerTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(! await Player.Exists(999), "Exists function works properly");
    });

    it("Add", async () =>
    {
        const res = await Player.Add("1", "1", 1, 1, 1);

        assert.ok(res, "Insert res id");

        lastid = res;
    });

    it("GetByid", async () =>
    {
        const res = await Player.GetById(lastid);
        assert.ok(res, "Select");
        assert.ok(res.id, "Last id res");
        assert.ok(res.username, "login");
        assert.ok(res.password, "password");
        assert.ok(res.factory_id, "factory_id");
        assert.ok(res.Factory, "Factory");
        assert.ok(res.cash, "cash");
        assert.ok(res.actor_id, "actor_id");
        assert.ok(res.Actor, "Actor");
    });

    it("Delete", async () =>
    {
        await Player.Delete(lastid);

        const res = await Player.Exists(lastid);
        assert.ok(!res, "Deleted player");
    });
});
