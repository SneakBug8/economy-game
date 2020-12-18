import { BuyOffer } from "entity/BuyOffer";
import { CalculatedPrice, CalculatedPriceType } from "entity/CalculatedPrice";
import { Player } from "entity/Player";
import { SellOffer } from "entity/SellOffer";
import { EventsList } from "events/EventsList";
import { Storage } from "entity/Storage";
import { TurnsService } from "./TurnsService";
import { Turn } from "entity/Turn";
import { PlayerService } from "./PlayerService";
import { Config } from "config";
import { Logger } from "utility/Logger";
import { Market } from "entity/Market";
import { Statistics, ICurrencyRecord, StatisticsTypes } from "entity/Statistics";

export class StateActivityService
{
    public static readonly PlayersMap: Map<number, number> = new Map([
        [1, 3],
        [2, 1],
    ]);

    public static async GetPlayer(marketId: number)
    {
        if (!this.PlayersMap.get(marketId)) {
            Logger.warn("no state player ID for market " + marketId);
            return null;
        }

        const res = await Player.GetById(this.PlayersMap.get(marketId));

        if (!res) {
            const id = await PlayerService.Register("State", "1133");
            const player = await Player.GetById(id);
            player.id = this.PlayersMap.get(marketId);
            await Player.Insert(player);
            return player;
        }
        return res;
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
                await StateActivityService.KeepMSRatio(market);
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
            const player = await StateActivityService.GetPlayer(market.id);

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
                        -1 * await Storage.Amount(player.CurrentMarketId, player.id, p.goodId));
                }
            }
        }
    }

    public static async PublishOrders()
    {
        for (const market of await Market.All()) {
            const player = await StateActivityService.GetPlayer(market.id);

            const currency = await market.getCurrency();

            if (!player) {
                return;
            }

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
                    Logger.verbose("Created buy order");

                    BuyOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    continue;
                }
                else if (p.type === CalculatedPriceType.Sell) {
                    Logger.verbose("Created sell order");

                    SellOffer.Create(player.CurrentMarketId, p.goodId, p.amount, p.price, player.id);
                    continue;
                }
            }

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
            const player = await StateActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

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
        const player = await Player.GetById(playerId);
        await Storage.AddGoodTo(player.CurrentMarketId,
            player.id,
            await Market.GetCashGoodId(player.CurrentMarketId),
            amount);
        TurnsService.RegisterNewCash(amount);
    }

    public static async MakeStatistics()
    {
        for (const market of await Market.All()) {
            const currency = await market.getCurrency();
            const player = await StateActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

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
