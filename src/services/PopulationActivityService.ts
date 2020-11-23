import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Storage } from "entity/Storage";
import { Turn } from "entity/Turn";
import { EventsList } from "events/EventsList";
import { Logger } from "utility/Logger";
import { TurnsService } from "./TurnsService";

export class PopulationActivityService
{
    public static readonly PlayerId = 2;

    public static Initialized = false;

    public static Init()
    {
        if (!this.Initialized) {
            EventsList.beforeMarket.on(async () => await this.BeforeMarketGeneration);
            EventsList.beforeMarket.on(async () => await this.PublishOrders);
            EventsList.afterMarket.on(async () => await this.AfterMarketCleanup);
            EventsList.onBeforeNewTurn.on(async (t) => await this.MakeStatistics(t));

            this.GetPlayer();

            this.Initialized = true;
        }
    }

    public static async GetPlayer()
    {
        if (this.Player) {
            await Player.Update(this.Player);
        }
        this.Player = await Player.GetById(this.PlayerId);
        Logger.verbose(`Loaded player ${this.Player.username}`);
        return this.Player;
    }

    public static async CommitPlayer()
    {
        if (this.Player) {
            await Player.Update(this.Player);
        }
    }

    public static async MakeStatistics(t: Turn)
    {
        await this.GetPlayer();

        Statistics.Create<IPlayerStatisticsRecord>(this.Player.id, t.id, StatisticsTypes.PlayerRecord, {
            cash: this.Player.cash,
        });
    }

    public static Player: Player;

    public static async BeforeMarketGeneration()
    {
        await this.GetPlayer();

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
        await this.GetPlayer();

        if (this.Player.cash <= 10000) {
            await this.CreateCash(10000);
        }

        const borders = await BuyOffer.GetWithActor(this.Player.actorId);
        for (const o of borders) {
            await BuyOffer.Delete(o.id);
        }

        const sorders = await SellOffer.GetWithActor(this.Player.actorId);
        for (const o of sorders) {
            await SellOffer.Delete(o.id);
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(this.Player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy) {
                await BuyOffer.Create(p.goodId, p.amount, p.price, this.Player.actorId);
                console.log("Created buy order");
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell) {
                await SellOffer.Create(p.goodId, p.amount, p.price, this.Player.actorId);
                console.log("Created sell order");

                continue;
            }
        }

    }

    public static async AfterMarketCleanup()
    {
        await this.GetPlayer();

        const calculatedprices = await CalculatedPrice.GetWithPlayer(this.Player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy &&
                await Storage.Has(this.Player.actorId, p.goodId, p.amount)) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Buy &&
                (await Storage.Amount(this.Player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                p.amount = Math.ceil(p.amount * 1.01);
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
                p.amount = Math.ceil(p.amount * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
        }
    }

    public static async AddCash(amount: number)
    {
        this.Player.cash += amount;
        await this.GetPlayer();
    }

    public static async CreateCash(amount: number)
    {
        this.Player.cash += amount;
        TurnsService.RegisterNewCash(amount);
        await this.GetPlayer();
    }
}
