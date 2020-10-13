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

        player.Actor = actor;
        player.Factory = factory;
        player.actor_id = a;
        player.factory_id = b;
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
        assert.ok(res.factory_id, "factory_id");
        assert.ok(res.Factory, "Factory");
        assert.ok(res.cash, "cash");
        assert.ok(res.actor_id, "actor_id");
        assert.ok(res.Actor, "Actor");
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
});