import "mocha";
import { Player } from "entity/Player";
import { PlayerService } from "services/PlayerService";
import assert = require("assert");

let lastid: number;

describe("UsersEngine", () =>
{
    it("Registration", async () =>
    {
        lastid = await PlayerService.Register("1", "1");
        const player = await Player.GetById(lastid);

        assert.ok(player, "New Player");
        assert.ok(player.id, "ID");
        assert.ok(player.username === "1", "login");
        assert.ok(player.password === "1", "password");
    });

    it("Login", async () =>
    {
        const player = await PlayerService.Login("1", "1");

        assert.ok(player, "New Player");
        assert.ok(player.id, "ID");
        assert.ok(player.username === "1", "login");
        assert.ok(player.password === "1", "password");
    });

    it("Delete", async () =>
    {
        await Player.Delete(lastid);
    });
});
