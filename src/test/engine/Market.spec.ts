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

        const factoryfirst = await playerfirst.getFactory();
        const factorysecond = await playersecond.getFactory();

        await Storage.AddGoodTo(factoryfirst, RecipesService.firstgood, 10);

        await SellOffer.Create(RecipesService.firstgood, 10, 1, actorfirst);
        await BuyOffer.Create(RecipesService.firstgood, 10, 1, actorsecond);

        await MarketService.Run();

        console.log(await Storage.Amount(factorysecond, RecipesService.firstgood));

        assert.ok(await Storage.Has(factorysecond, RecipesService.firstgood, 10), "Bought 10 goods");

        await Player.Delete(newplayerid);
        await Player.Delete(anotherlayerid);
    });
});
