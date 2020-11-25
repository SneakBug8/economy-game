import { Config } from "config";
import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Storage } from "entity/Storage";
import { Turn } from "entity/Turn";
import { EventsList } from "events/EventsList";
import { config } from "process";
import { Runner } from "Runner";
import { Logger } from "utility/Logger";
import { PlayerService } from "./PlayerService";
import { TurnsService } from "./TurnsService";

export class PopulationActivityService
{
    public static readonly PlayersMap: Map<number, number> = new Map([
        [1, 4],
        [2, 2],
    ]);

    public static Initialized = false;

    public static async Init()
    {
        if (!PopulationActivityService.Initialized) {
            EventsList.beforeMarket.on(PopulationActivityService.BeforeMarketGeneration);
            EventsList.beforeMarket.on(PopulationActivityService.PublishOrders);
            EventsList.afterMarket.on(PopulationActivityService.AfterMarketCleanup);
            // EventsList.onBeforeNewTurn.on(async (t) => await PopulationActivityService.MakeStatistics(t));

            PopulationActivityService.Initialized = true;
        }
    }

    public static async GetPlayer(marketId: number)
    {
        if (!PopulationActivityService.PlayersMap.get(marketId)) {
            Logger.warn("no population player ID for market " + marketId);
            return null;
        }

        const res = await Player.GetById(PopulationActivityService.PlayersMap.get(marketId));

        if (!res) {
            const id = await PlayerService.Register("Population", "1122");
            const player = await Player.GetById(id);
            player.id = PopulationActivityService.PlayersMap.get(marketId);
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
        for (const market of await Market.All()) {
            const player = await PopulationActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Sell) {
                    Storage.AddGoodTo(player.CurrentMarketId, player.id, p.goodId, p.amount);
                }
                if (p.type === CalculatedPriceType.Buy) {
                    Storage.AddGoodTo(player.CurrentMarketId, player.id, p.goodId,
                        await Storage.Amount(player.CurrentMarketId, player.id, p.goodId));
                }
            }
        }
    }

    public static async PublishOrders()
    {
        for (const market of await Market.All()) {
            const player = await PopulationActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            if (await player.AgetCash() <= 10000) {
                for (const c of calculatedprices) {
                    c.amount = Math.floor(0.99 * c.amount);
                    await CalculatedPrice.Update(c);
                    if (Runner.ApiProvider) {
                        Runner.ApiProvider.broadcast("Population starves! Increase salaries or whole economy will collapse!");
                    }
                }
            }
            else if (await player.AgetCash() >= 20000) {
                for (const c of calculatedprices) {
                    c.amount = Math.ceil(1.01 * c.amount);
                    await CalculatedPrice.Update(c);
                    if (Runner.ApiProvider) {
                        Runner.ApiProvider.broadcast("Population grows and so does it's consumption! Good work with those salaries!");
                    }
                }
            }

            const borders = await BuyOffer.GetWithPlayer(player.id);
            for (const o of borders) {
                await BuyOffer.Delete(o.id);
            }

            const sorders = await SellOffer.GetWithPlayer(player.id);
            for (const o of sorders) {
                await SellOffer.Delete(o.id);
            }

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy) {
                    await BuyOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    Logger.verbose("Created buy order");
                    continue;
                }
                else if (p.type === CalculatedPriceType.Sell) {
                    await SellOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    Logger.verbose("Created sell order");

                    continue;
                }
            }
        }
    }

    public static async AfterMarketCleanup()
    {
        for (const market of await Market.All()) {
            const player = await PopulationActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy &&
                    await Storage.Has(player.CurrentMarketId, player.id, p.goodId, p.amount)) {
                    p.price = Math.floor(p.price * 0.99);
                    CalculatedPrice.Update(p);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Buy &&
                    (await Storage.Amount(player.CurrentMarketId, player.id, p.goodId)) === 0) {
                    p.price = Math.ceil(p.price * 1.01);
                    p.amount = Math.ceil(p.amount * 1.01);
                    CalculatedPrice.Update(p);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Sell &&
                    (await Storage.Amount(player.CurrentMarketId, player.id, p.goodId)) > 0) {
                    p.price = Math.floor(p.price * 0.99);
                    CalculatedPrice.Update(p);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Sell &&
                    (await Storage.Amount(player.CurrentMarketId, player.id, p.goodId)) === 0) {
                    p.price = Math.ceil(p.price * 1.01);
                    p.amount = Math.ceil(p.amount * 1.01);
                    CalculatedPrice.Update(p);
                    continue;
                }
            }
        }
    }

    public static async CreateCash(player: Player, amount: number)
    {
        await Storage.AddGoodTo(player.CurrentMarketId,
            player.id,
            await Market.GetCashGoodId(player.CurrentMarketId),
            amount);
        TurnsService.RegisterNewCash(amount);
    }

    public static async DoMarketingMoveOn(marketId: number, playerId: number, goodId: number)
    {
        const player = await Player.GetById(playerId);

        const poplayer = await this.GetPlayer(marketId);
        const price = await CalculatedPrice.GetWithPlayerAndGood(poplayer.id, goodId);

        const cost = price.price * price.amount * 10;

        if (await player.AgetCash() < cost) {
            return "Not enough cash";
        }

        price.amount = Math.ceil(price.amount * 1.1);

        await player.payCash(poplayer, cost);

        await CalculatedPrice.Update(price);
    }
}
