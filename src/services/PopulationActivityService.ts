import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Consumption } from "entity/Consumption";
import { MarketActor } from "entity/MarketActor";
import { Player } from "entity/Player";
import { PriceRecord } from "entity/PriceRecord";
import { Production } from "entity/Production";
import { SellOffer } from "entity/SellOffer";
import { Storage } from "entity/Storage";
import { EventsList } from "events/EventsList";

export class PopulationActivityService
{
    public static readonly StatePlayerId = 2;

    public static Initialized = false;

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.onAfterNewTurn.on((t) => this.BeforeMarketGeneration);
            EventsList.onAfterNewTurn.on((t) => this.PublishOrders);
            EventsList.onBeforeNewTurn.on((t) => this.AfterMarketCleanup);
            this.Initialized = true;
        }
    }

    public static async GetPlayer()
    {
        if (this.Player) {
            await Player.Update(this.Player);
        }
        this.Player = await Player.GetById(this.StatePlayerId);
        return this.Player;
    }

    public static async CommitPlayer()
    {
        if (this.Player) {
            await Player.Update(this.Player);
        }
    }

    public static Player: Player;

    public static async BeforeMarketGeneration()
    {
        const calculatedprices = await CalculatedPrice.GetWithPlayer(this.Player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Sell) {
                Storage.AddGoodTo(this.Player.actorId, p.goodId, p.amount);
            }
            if (p.type === CalculatedPriceType.Buy) {
                Storage.AddGoodTo(this.Player.actorId, p.goodId,
                    await Storage.Amount(this.Player.actorId, p.goodId));
            }
        }
    }

    public static async PublishOrders()
    {
        const calculatedprices = await CalculatedPrice.GetWithPlayer(this.Player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy) {
                BuyOffer.Create(p.goodId, p.amount, p.price, this.Player.actorId);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell) {
                SellOffer.Create(p.goodId, p.amount, p.price, this.Player.actorId);
                continue;
            }
        }
    }

    public static async AfterMarketCleanup()
    {
        const calculatedprices = await CalculatedPrice.GetWithPlayer(this.Player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy &&
                Storage.Has(this.Player.actorId, p.goodId, p.amount)) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Buy &&
                (await Storage.Amount(this.Player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(this.Player.actorId, p.goodId)) > 0) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(this.Player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
        }
    }

    public static AddCash(amount: number)
    {
        this.Player.cash += amount;
        console.log(`Current free cash is: ${this.Player.cash} (change: ${amount})`);
        this.CommitPlayer();
    }
}