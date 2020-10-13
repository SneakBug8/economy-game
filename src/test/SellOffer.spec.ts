import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { SellOffer } from "entity/SellOffer";

describe("SellOfferTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(! await SellOffer.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        if (!SellOffer.Exists(1)) {
            assert.ok(true, "No test offer to check");
            return;
        }

        const selloffer = await SellOffer.GetById(1);

        assert.ok(selloffer.id, "ID");
        assert.ok(selloffer.marketId, "Market ID");
        assert.ok(selloffer.actorId, "Actor ID");
        assert.ok(selloffer.goodId, "good id");
        assert.ok(selloffer.amount, "Amount");
        assert.ok(selloffer.price, "Price");
        assert.ok(selloffer.turn_id, "Turn ID");

        assert.ok(selloffer.Good, "Good");
        assert.ok(selloffer.Market, "Market");
        assert.ok(selloffer.MarketActor, "Actor");

    });
});