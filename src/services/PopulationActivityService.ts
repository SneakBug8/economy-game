import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Storage } from "entity/Storage";
import { Turn } from "entity/Turn";
import { EventsList } from "events/EventsList";
import { Runner } from "Runner";
import { Logger } from "utility/Logger";
import { PlayerService } from "./PlayerService";
import { TurnsService } from "./TurnsService";

export class PopulationActivityService
{
    public static readonly PlayerId = 2;

    public static Initialized = false;

    public static async Init()
    {
        if (!PopulationActivityService.Initialized) {
            EventsList.beforeMarket.on(PopulationActivityService.BeforeMarketGeneration);
            EventsList.beforeMarket.on(PopulationActivityService.PublishOrders);
            EventsList.afterMarket.on(PopulationActivityService.AfterMarketCleanup);
            // EventsList.onBeforeNewTurn.on(async (t) => await PopulationActivityService.MakeStatistics(t));

            await PopulationActivityService.GetPlayer();

            PopulationActivityService.Initialized = true;
        }
    }

    public static async GetPlayer()
    {
        const res = await Player.GetById(PopulationActivityService.PlayerId);
        if (!res) {
            const id = await PlayerService.Register("Population", "1122");
            const player = await Player.GetById(id);
            player.id = PopulationActivityService.PlayerId;
            await Player.Insert(player);
            return player;
        }
        return res;
    }

    public static async MakeStatistics(t: Turn)
    {
        /*await PopulationActivityService.GetPlayer();

        Statistics.Create<IPlayerStatisticsRecord>(PopulationActivityService.Player.id, t.id, StatisticsTypes.PlayerRecord, {
            cash: PopulationActivityService.Player.cash,
        });*/
    }

    public static async BeforeMarketGeneration()
    {
        const player = await PopulationActivityService.GetPlayer();

        if (!player) {
            return;
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Sell) {
                Storage.AddGoodTo(player.CurrentMarketId, player.actorId, p.goodId, p.amount);
            }
            if (p.type === CalculatedPriceType.Buy) {
                Storage.AddGoodTo(player.CurrentMarketId, player.actorId, p.goodId,
                    await Storage.Amount(player.CurrentMarketId, player.actorId, p.goodId));
            }
        }
    }

    public static async PublishOrders()
    {
        const player = await PopulationActivityService.GetPlayer();

        if (!player) {
            return;
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        if (player.cash <= 10000) {
            for (const c of calculatedprices) {
                c.amount = Math.floor(0.99 * c.amount);
                await CalculatedPrice.Update(c);
                if (Runner.ApiProvider) {
                    Runner.ApiProvider.broadcast("Population starves! Increase salaries or whole economy will collapse!");
                }
            }
        }
        else if (player.cash >= 20000) {
            for (const c of calculatedprices) {
                c.amount = Math.ceil(1.01 * c.amount);
                await CalculatedPrice.Update(c);
                if (Runner.ApiProvider) {
                    Runner.ApiProvider.broadcast("Population grows and so does it's consumption! Good work with those salaries!");
                }
            }
        }

        const borders = await BuyOffer.GetWithActor(player.actorId);
        for (const o of borders) {
            await BuyOffer.Delete(o.id);
        }

        const sorders = await SellOffer.GetWithActor(player.actorId);
        for (const o of sorders) {
            await SellOffer.Delete(o.id);
        }

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy) {
                await BuyOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.actorId);
                console.log("Created buy order");
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell) {
                await SellOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.actorId);
                console.log("Created sell order");

                continue;
            }
        }

    }

    public static async AfterMarketCleanup()
    {
        const player = await PopulationActivityService.GetPlayer();

        if (!player) {
            return;
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy &&
                await Storage.Has(player.CurrentMarketId, player.actorId, p.goodId, p.amount)) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Buy &&
                (await Storage.Amount(player.CurrentMarketId, player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                p.amount = Math.ceil(p.amount * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(player.CurrentMarketId, player.actorId, p.goodId)) > 0) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(player.CurrentMarketId, player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                p.amount = Math.ceil(p.amount * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
        }
    }

    public static async AddCash(amount: number)
    {
        const player = await this.GetPlayer();
        player.cash += amount;
        await Player.Update(player);
    }

    public static async CreateCash(player: Player, amount: number)
    {
        player.cash += amount;
        TurnsService.RegisterNewCash(amount);
        await Player.Update(player);
    }
}
