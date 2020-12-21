import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { EventsList } from "events/EventsList";
import { Storage } from "entity/Storage";
import { TurnsService } from "./TurnsService";
import { Turn } from "entity/Turn";
import { Config } from "config";
import { Logger } from "utility/Logger";
import { Market } from "entity/Market";
import { Statistics, ICurrencyRecord, StatisticsTypes } from "entity/Statistics";
import { Requisite } from "./Requisites/Requisite";

export class StateActivityService
{
    public static async GetPlayerIds() {
        let markets = await Market.All();
        const ids = await Promise.all(markets.map(async (x) => await this.GetPlayerId(x.id)));
        return ids.filter(x => x);
    }

    public static async GetPlayerId(marketId: number) {
        const market = await Market.GetById(marketId);
        return market.govPlayerId;
    }

    public static async GetPlayer(marketId: number)
    {
        const plid = await this.GetPlayerId(marketId);
        if (!plid) {
            return new Requisite<Player>().error("no state player ID for market " + marketId);
        }

        return await Player.GetById(plid);
    }

    public static Initialized = false;

    public static async Init()
    {
        if (!StateActivityService.Initialized) {
            EventsList.onAfterNewTurn.on(StateActivityService.onAfterNewTurn);
            EventsList.beforeMarket.on(StateActivityService.BeforeMarketGeneration);
            EventsList.beforeMarket.on(StateActivityService.PublishOrders);
            EventsList.afterMarket.on(StateActivityService.AfterMarketCleanup);
            EventsList.onBeforeNewTurn.on(StateActivityService.MakeStatistics);
            // EventsList.onBeforeNewTurn.on(async (t) => await StateActivityService.MakeStatistics(t));

            StateActivityService.Initialized = true;
        }
    }

    public static async onAfterNewTurn(turn: Turn)
    {
        for (const market of await Market.All()) {
            if (market.GovStrategy.keepMSRatio) {
                // await StateActivityService.KeepMSRatio(market);
            }
        }
    }

    /*await StateActivityService.GetPlayer();

    Statistics.Create<IPlayerStatisticsRecord>(StateActivityService.Player.id, t.id, StatisticsTypes.PlayerRecord, {
        cash: StateActivityService.Player.cash,
    });*/

    public static async BeforeMarketGeneration()
    {
        for (const market of await Market.All()) {
            const pcheck = await StateActivityService.GetPlayer(market.id);

            if (!pcheck.result) {
                return pcheck;
            }

            const player = pcheck.data;

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy) {
                    await Storage.AddGoodTo(player.CurrentMarketId, player.id, p.goodId,
                        -1 * await Storage.Amount(player.CurrentMarketId, player.id, p.goodId));
                }
            }
        }
    }

    public static async PublishOrders()
    {
        Logger.info("Publishing State orders");

        for (const market of await Market.All()) {
            const pcheck = await StateActivityService.GetPlayer(market.id);

            if (!pcheck) {
                return pcheck;
            }

            const player = pcheck.data;

            /*if (await player.AgetCash() <= 10000) {

                if (market.GovStrategy.changeExchangeRate) {
                    (await market.getCurrency()).exchangeRate--;
                    Market.Update(market);
                }
                else {
                    await StateActivityService.CreateCash(player.id, 10000);
                }
            }
            else {
                // Make regular inflation
                await StateActivityService.CreateCash(
                    player.id,
                    Math.ceil(TurnsService.CurrentTurn.totalcash * Config.EverydayInflation)
                );
            }*/

            // Clear buy/ sell orders
            const borders = await BuyOffer.GetWithPlayer(player.id);
            for (const o of borders) {
                await BuyOffer.Delete(o.id);
            }

            const sorders = await SellOffer.GetWithPlayer(player.id);
            for (const o of sorders) {
                await SellOffer.Delete(o.id);
            }

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy) {
                    const r = await BuyOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    if (typeof r !== "string") {
                        Logger.info(`State ${player.username} created buy order for ${p.amount} of ${p.goodId} at ${p.price}`);
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
                        Logger.info(`State ${player.username} created sell order for ${p.amount} of ${p.goodId} at ${p.price}`);
                    }
                    else {
                        Logger.warn(r);
                    }
                    continue;
                }
            }

            /*
            // Sell All Gold
            const goldreserve = await Storage.Amount(market.id, player.id, Config.GoldGoodId);

            if (goldreserve > 0) {
                if (market.GovStrategy.goldBuySize) {
                    await SellOffer.Create(market.id, Config.GoldGoodId,
                        Math.round(goldreserve * market.GovStrategy.goldBuySize), currency.exchangeRate,
                        player.id);
                }
                else {
                    await SellOffer.Create(market.id, Config.GoldGoodId, goldreserve, currency.exchangeRate,
                        player.id);
                }
            }

            if (market.GovStrategy.goldSellSize) {
                await BuyOffer.Create(market.id, Config.GoldGoodId,
                    Math.round(goldreserve / market.GovStrategy.goldSellSize), currency.exchangeRate,
                    player.id);
            }
            else {
                await BuyOffer.Create(market.id, Config.GoldGoodId, goldreserve, currency.exchangeRate,
                    player.id);
            }
            */
        }
    }

    public static async KeepMSRatio(market: Market)
    {
        /*const currency = await market.getCurrency();

        const statsolder = await Statistics.GetWithPlayerAndTurnAndType<ICurrencyRecord>(
            this.PlayersMap.get(market.id),
            TurnsService.CurrentTurn.id - 2,
            StatisticsTypes.CurrencyRecord,
        );

        const statsold = await Statistics.GetWithPlayerAndTurnAndType<ICurrencyRecord>(
            this.PlayersMap.get(market.id),
            TurnsService.CurrentTurn.id - 1,
            StatisticsTypes.CurrencyRecord,
        );

        if (!statsolder || !statsold) {
            return;
        }

        if (statsolder.Value.goldreserve > statsold.Value.goldreserve) {
            await this.CreateCash(this.PlayersMap.get(market.id),
            (statsolder.Value.goldreserve - statsold.Value.goldreserve) * currency.exchangeRate);
        }*/
    }

    public static async AfterMarketCleanup()
    {
        for (const market of await Market.All()) {
            const pcheck = await StateActivityService.GetPlayer(market.id);

            if (!pcheck.result) {
                return pcheck;
            }

            const player = pcheck.data;

            player.CurrentMarketId = market.id;
            await Player.Update(player);

            const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

            for (const p of calculatedprices) {
                if (p.type === CalculatedPriceType.Buy &&
                    await Storage.Has(player.CurrentMarketId, player.id, p.goodId, p.amount)) {
                    p.price = Math.floor(p.price * 1.01);
                    CalculatedPrice.Update(p);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Buy &&
                    (await Storage.Amount(player.CurrentMarketId, player.id, p.goodId)) === 0) {
                    p.price = Math.ceil(p.price * 0.99);
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

    public static async CreateCash(playerId: number, amount: number)
    {
        const pcheck = await Player.GetById(playerId);
        if (!pcheck.result) {
            return pcheck;
        }
        const player = pcheck.data;
        TurnsService.RegisterNewCash(amount);
        return await Storage.AddGoodTo(player.CurrentMarketId,
            player.id,
            await Market.GetCashGoodId(player.CurrentMarketId),
            amount);
    }

    public static async MakeStatistics()
    {
        for (const market of await Market.All()) {
            const currency = await market.getCurrency();
            const pcheck = await StateActivityService.GetPlayer(market.id);

            if (!pcheck) {
                return pcheck;
            }
            const player = pcheck.data;

            const aggrgoods = await Storage.SumWithGood(await market.getCashGoodId());

            const lastrecord = await Statistics.GetWithPlayerAndTurnAndType<ICurrencyRecord>(
                player.id,
                TurnsService.CurrentTurn.id - 1,
                StatisticsTypes.CurrencyRecord,
            );

            const lasttotalamount = (lastrecord && lastrecord.Value.totalamount) || 0;

            const goldreserve = await Storage.Amount(
                market.id,
                player.id,
                Config.GoldGoodId,
            );

            Statistics.Create<ICurrencyRecord>(
                player.id,
                TurnsService.CurrentTurn.id,
                StatisticsTypes.CurrencyRecord,
                {
                    goodId: await market.getCashGoodId(),
                    totalamount: aggrgoods,
                    inflation: (lasttotalamount) ? aggrgoods - lasttotalamount : 0,
                    goldExchangeRate: currency.exchangeRate,
                    goldreserve,
                },
            );
        }
    }
}
