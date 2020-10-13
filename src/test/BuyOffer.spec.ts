import * as assert from "assert";
import "mocha";
import { BuyOffer } from "BuyOffer";

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
        assert.ok(buyoffer.market_id, "Market ID");
        assert.ok(buyoffer.actor_id, "Actor ID");
        assert.ok(buyoffer.good_id, "good");
        assert.ok(buyoffer.amount, "Amount");
        assert.ok(buyoffer.price, "Price");
        assert.ok(buyoffer.turn_id, "Turn ID");

        assert.ok(buyoffer.Good, "Good");
        assert.ok(buyoffer.Market, "Market");
    });
});
