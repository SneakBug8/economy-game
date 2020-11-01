import * as assert from "assert";
import "mocha";
import { BuyOffer } from "entity/BuyOffer";

describe("BuyOfferTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(! await BuyOffer.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        if (!await BuyOffer.Exists(1)) {
            assert.ok(true, "No test offer to check");
            return;
        }

        const buyoffer = await BuyOffer.GetById(1);

        assert.ok(buyoffer.id, "ID");
        assert.ok(buyoffer.amount, "Amount");
        assert.ok(buyoffer.price, "Price");
        assert.ok(buyoffer.turn_id, "Turn ID");

        assert.ok(await buyoffer.getGood(), "Good");
        assert.ok(await buyoffer.getActor(), "MarketActor");
        assert.ok(await buyoffer.getMarket(), "Market");
    });
});
