import * as assert from "assert";
import "mocha";
import { Player } from "entity/Player";
import { MarketActor } from "entity/MarketActor";
import { Factory } from "entity/Factory";
import { PlayerService } from "services/PlayerService";

let lastid = 1;

describe("PlayerTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(! await Player.Exists(999), "Exists function works properly");
    });

    it("Add", async () =>
    {
        lastid = await PlayerService.Register("a", "b");

        const player = await Player.GetById(lastid);

        assert.ok(player, "Insert res id");
    });

    it("GetByid", async () =>
    {
        const res = await Player.GetById(lastid);
        assert.ok(res, "Select");
        assert.ok(res.id, "Last id res");
        assert.ok(res.username, "login");
        assert.ok(res.password, "password");
        assert.ok(await res.getFactories(), "factory_id");
        assert.ok(res.cash, "cash");
        assert.ok(res.actorId, "actor_id");
    });

    it("Update", async () =>
    {
        const a = await Player.GetById(lastid);
        a.username = "beta";

        await Player.Update(a);
        const res = await Player.GetById(lastid);

        assert.ok(res.username === a.username, "Last id res");
        assert.ok(res, "Select");
        assert.ok(res.id, "Last id res");
        assert.ok(res.username, "login");
        assert.ok(res.password, "password");
        assert.ok(await res.getFactories(), "Factory");
        assert.ok(res.cash, "cash");
        assert.ok(res.actorId, "actor_id");
        assert.ok(await res.getActor(), "Actor");
    });

    it("All", async () =>
    {
        const players = await Player.All();

        assert.ok(players.length, "count");
        assert.ok(players[0].id, "ID");
    });

    it("Count", async () =>
    {
        const count = await Player.Count();

        assert.ok(count, "count");
    });

    it("Delete", async () =>
    {
        await Player.Delete(lastid);

        const res = await Player.Exists(lastid);
        assert.ok(!res, "Deleted player");
    });
});