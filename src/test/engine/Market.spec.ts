import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { RecipesService } from "services/RecipesService";
import { Player } from "entity/Player";
import { UsersService } from "services/UsersService";
import { ProductionService } from "services/ProductionService";
import { Storage } from "entity/Storage";
import { Runner } from "Runner";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Market } from "entity/Market";
import { MarketService } from "services/MarketService";
import { Log } from "entity/Log";

describe("MarketEngine", () =>
{
    it("TradesBetweenPlayers", async () =>
    {
        Runner.Init();

        const newplayerid = await UsersService.Register("1", "1");
        const playerfirst = await Player.GetById(newplayerid);
        playerfirst.Verbose();

        const anotherlayerid = await UsersService.Register("2", "2");
        const playersecond = await Player.GetById(anotherlayerid);
        playersecond.Verbose();

        const actorfirst = await playerfirst.getActor();
        const actorsecond = await playersecond.getActor();

        await Storage.AddGoodTo(actorfirst, RecipesService.firstgood, 10);

        await SellOffer.Create(RecipesService.firstgood, 10, 1, actorfirst);
        await BuyOffer.Create(RecipesService.firstgood, 10, 1, actorsecond);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actorsecond, RecipesService.firstgood) > 0, "Traded goods")
        assert.ok(await Storage.Has(actorsecond, RecipesService.firstgood, 10), "Traded 10 goods");

        await Player.Delete(newplayerid);
        await Player.Delete(anotherlayerid);
    });

    let playerid;

    it("BuyFromServer", async () =>
    {
        Runner.Init();

        playerid = await UsersService.Register("3", "3");
        const player = await Player.GetById(playerid);

        player.Verbose();

        const actor = await player.getActor();

        await BuyOffer.Create(RecipesService.firstgood, 10, 1, actor);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actor, RecipesService.firstgood) > 0, "Bought goods")
        assert.ok(await Storage.Has(actor, RecipesService.firstgood, 10), "Bought 10 goods");
    });

    it("SellToServer", async () =>
    {
        Runner.Init();

        const player = await Player.GetById(playerid);
        player.Verbose();

        const actor = await player.getActor();

        await SellOffer.Create(RecipesService.firstgood, 10, 1, actor);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actor, RecipesService.firstgood) === 0, "Sold goods")

        await Player.Delete(playerid);
    });
});
