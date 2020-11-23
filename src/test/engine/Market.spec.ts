import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { RecipesService } from "services/RecipesService";
import { Player } from "entity/Player";
import { PlayerService } from "services/PlayerService";
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

        const newplayerid = await PlayerService.Register("1", "1");
        const playerfirst = await Player.GetById(newplayerid);
        playerfirst.Verbose();

        const anotherlayerid = await PlayerService.Register("2", "2");
        const playersecond = await Player.GetById(anotherlayerid);
        playersecond.Verbose();

        const actorfirst = await playerfirst.getActor();
        const actorsecond = await playersecond.getActor();

        await Storage.AddGoodTo(actorfirst.id, RecipesService.firstgood.id, 10);

        await SellOffer.Create(RecipesService.firstgood.id, 10, 1, actorfirst.id);
        await BuyOffer.Create(RecipesService.firstgood.id, 10, 1, actorsecond.id);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actorsecond.id, RecipesService.firstgood.id) > 0, "Traded goods")
        assert.ok(await Storage.Has(actorsecond.id, RecipesService.firstgood.id, 10), "Traded 10 goods");

        await Player.Delete(newplayerid);
        await Player.Delete(anotherlayerid);
    });

    let playerid;

    it("BuyFromServer", async () =>
    {
        Runner.Init();

        playerid = await PlayerService.Register("3", "3");
        const player = await Player.GetById(playerid);

        player.Verbose();

        const actor = await player.getActor();

        await BuyOffer.Create(RecipesService.firstgood.id, 10, 1, actor.id);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actor.id, RecipesService.firstgood.id) > 0, "Bought goods")
        assert.ok(await Storage.Has(actor.id, RecipesService.firstgood.id, 10), "Bought 10 goods");
    });

    it("SellToServer", async () =>
    {
        Runner.Init();

        const player = await Player.GetById(playerid);
        player.Verbose();

        const actor = await player.getActor();

        await SellOffer.Create(RecipesService.firstgood.id, 10, 1, actor.id);

        await MarketService.Run();

        assert.ok(await Storage.Amount(actor.id, RecipesService.firstgood.id) === 0, "Sold goods");

        await Player.Delete(playerid);
    });
});
