import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { IPlayerStatisticsRecord, Statistics, StatisticsTypes } from "entity/Statistics";
import { Storage } from "entity/Storage";
import { Turn } from "entity/Turn";
import { EventsList } from "events/EventsList";
import { Logger } from "utility/Logger";
import { PlayerService } from "./PlayerService";
import { Requisite } from "./Requisites/Requisite";
import { TurnsService } from "./TurnsService";

export class PopulationActivityService
{
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

    public static async GetPlayerIds() {
        let markets = await Market.All();
        const ids = await Promise.all(markets.map(async (x) => await this.GetPlayerId(x.id)));
        return ids.filter(x => x);
    }

    public static async GetPlayerId(marketId: number) {
        const market = await Market.GetById(marketId);
        return market.popPlayerId;
    }

    public static async GetPlayer(marketId: number)
    {
        const plid = await this.GetPlayerId(marketId);
        if (!plid) {
            return new Requisite<Player>().error("no population player ID for market " + marketId);
        }

        return await Player.GetById(plid);
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
            const pcheck = await PopulationActivityService.GetPlayer(market.id);

            if (!pcheck.result) {
                return pcheck;
            }

            const player = pcheck.data;
            player.CurrentMarketId = market.id;
            await Player.Update(player);

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy) {
                    Storage.AddGoodTo(player.CurrentMarketId, player.id, p.goodId,
                        await Storage.Amount(player.CurrentMarketId, player.id, p.goodId));
                }
            }
        }
    }

    public static async PublishOrders()
    {
        Logger.info("Publishing Pops orders");
        for (const market of await Market.All()) {
            const pcheck = await PopulationActivityService.GetPlayer(market.id);

            if (!pcheck.result) {
                return pcheck;
            }

            const player = pcheck.data;
            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            if (await player.AgetCash() <= 10000) {
                for (const c of calculatedprices) {
                    c.amount = Math.floor(0.99 * c.amount);
                    await CalculatedPrice.Update(c);
                }
                PlayerService.Broadcast(`Population of ${market.name} starves! Increase salaries or whole economy will collapse!`);
            }
            else if (await player.AgetCash() >= 20000) {
                for (const c of calculatedprices) {
                    c.amount = Math.ceil(1.01 * c.amount);
                    await CalculatedPrice.Update(c);
                }
                PlayerService.Broadcast(
                    `Population of ${market.name} grows and so does it's consumption! Good work with those salaries!`
                );
            }

            const borders = await BuyOffer.GetWithPlayer(player.id);
            for (const o of borders) {
                await BuyOffer.Delete(o.id);
            }

            const sorders = await SellOffer.GetWithPlayer(player.id);
            for (const o of sorders) {
                await SellOffer.Delete(o.id);
            }

            player.CurrentMarketId = market.id;
            await Player.Update(player);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy) {
                    const r = await BuyOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    if (typeof r !== "string") {
                        PlayerService.SendOffline(player.id,
                            `Pop ${player.username} created buy order for ${p.amount} of ${p.goodId} at ${p.price}`
                            );
                        Logger.verbose(`Pop ${player.username} created buy order for ${p.amount} of ${p.goodId} at ${p.price}`);
                    }
                    else {
                        Logger.warn(r);
                    }
                    continue;
                }
                else if (p.type === CalculatedPriceType.Sell) {
                    await Storage.AddGoodTo(player.CurrentMarketId, player.id, p.goodId, p.amount);
                    const r = await SellOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    if (typeof r !== "string") {
                        PlayerService.SendOffline(player.id,
                            `Pop ${player.username} created sell order for ${p.amount} of ${p.goodId} at ${p.price}`);
                        Logger.verbose(`Pop ${player.username} created sell order for ${p.amount} of ${p.goodId} at ${p.price}`);
                    }
                    else {
                        Logger.warn(r);
                    }
                    continue;
                }
            }
        }
    }

    public static async AfterMarketCleanup()
    {
        for (const market of await Market.All()) {
            const pcheck = await PopulationActivityService.GetPlayer(market.id);

            if (!pcheck.result) {
                return pcheck;
            }

            const player = pcheck.data;

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy &&
                    await Storage.Has(player.CurrentMarketId, player.id, p.goodId, p.amount)) {
                    p.price = Math.floor(p.price * 0.99);
                    CalculatedPrice.Update(p);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Buy &&
                    (await Storage.Amount(player.CurrentMarketId, player.id, p.goodId)) < p.amount) {
                    p.price = Math.ceil(p.price * 1.01);
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

    public static async TransferCash(marketId: number, playerId: number, amount: number)
    {
        const pcheck = await this.GetPlayer(marketId);

        if (!pcheck.result) {
            return pcheck;
        }

        await Player.TransferCash(pcheck.data.id, playerId, amount);
        return new Requisite().success("Successfuly transfered");
    }

    public static async DoMarketingMoveOn(marketId: number, playerId: number, goodId: number)
    {
        const player = await Player.GetById(playerId);

        if (!player.result) {
            return player;
        }

        const poplayer = await this.GetPlayer(marketId);

        if (!poplayer.result) {
            return poplayer;
        }

        const price = await CalculatedPrice.GetWithPlayerAndGood(poplayer.data.id, goodId);

        const cost = price.price * price.amount * 10;

        if (await player.data.AgetCash() < cost) {
            return "Not enough cash";
        }

        price.amount = Math.ceil(price.amount * 1.1);

        await player.data.payCash(poplayer.data, cost);

        await CalculatedPrice.Update(price);
    }
}
