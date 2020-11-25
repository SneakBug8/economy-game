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
            EventsList.beforeMarket.on(StateActivityService.BeforeMarketGeneration);
            EventsList.beforeMarket.on(StateActivityService.PublishOrders);
            EventsList.afterMarket.on(StateActivityService.AfterMarketCleanup);
            //EventsList.onBeforeNewTurn.on(async (t) => await StateActivityService.MakeStatistics(t));

            StateActivityService.Initialized = true;
        }
    }

    public static async MakeStatistics()
    {
        /*await StateActivityService.GetPlayer();

        Statistics.Create<IPlayerStatisticsRecord>(StateActivityService.Player.id, t.id, StatisticsTypes.PlayerRecord, {
            cash: StateActivityService.Player.cash,
        });*/
    }

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
                        await Storage.Amount(player.CurrentMarketId, player.id, p.goodId));
                }
            }
        }
    }

    public static async PublishOrders()
    {
        for (const market of await Market.All()) {
            const player = await StateActivityService.GetPlayer(market.id);

            if (!player) {
                return;
            }

            if (player.cash <= 10000) {
                await StateActivityService.CreateCash(market.id, 10000);
            }
            else {
                // Make regular inflation
                await StateActivityService.CreateCash(
                    market.id,
                    Math.ceil(TurnsService.CurrentTurn.totalcash * Config.EverydayInflation)
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
        }
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

    public static async AddCash(marketId: number, amount: number)
    {
        const player = await this.GetPlayer(marketId);
        player.cash += amount;
        Player.Update(player);
    }

    public static async CreateCash(playerId: number, amount: number)
    {
        const player = await Player.GetById(playerId);
        player.cash += amount;
        await Player.Update(player);
        TurnsService.RegisterNewCash(amount);
    }
}
