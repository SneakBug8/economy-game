import * as assert from "assert";
import "mocha";
import { Player } from "entity/Player";
import { MarketActor } from "entity/MarketActor";
import { Factory } from "entity/Factory";

let lastid = 1;

describe("PlayerTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(! await Player.Exists(999), "Exists function works properly");
    });

    it("Add", async () =>
    {
        const player = new Player();
        const actor = new MarketActor();
        const factory = new Factory();

        const a = await MarketActor.Insert(actor);
        const b = await Factory.Insert(factory);

        player.actorId = a;
        player.factoryId = b;
        player.username = "a"; player.password = "b"; player.cash = 2;

        const res = await Player.Insert(player);

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
        assert.ok(res.factoryId, "factory_id");
        assert.ok(res.cash, "cash");
        assert.ok(res.actorId, "actor_id");
    });

    it("Update", async () =>
    {
        const a = await Player.GetById(lastid);
        a.cash *= 2;

        await Player.Update(a);
        const res = await Player.GetById(lastid);

        assert.ok(res.cash === a.cash, "Last id res");
        assert.ok(res, "Select");
        assert.ok(res.id, "Last id res");
        assert.ok(res.username, "login");
        assert.ok(res.password, "password");
        assert.ok(res.factoryId, "factory_id");
        assert.ok(await res.getFactory(), "Factory");
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