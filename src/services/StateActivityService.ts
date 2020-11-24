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

export class StateActivityService
{
    public static readonly PlayerId = 1;

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

    public static async GetPlayer()
    {
        const res = await Player.GetById(StateActivityService.PlayerId);
        if (!res) {
            const id = await PlayerService.Register("State", "1122");
            const player = await Player.GetById(id);
            player.id = StateActivityService.PlayerId;
            await Player.Insert(player);
            return player;
        }
        return res;
    }

    public static async BeforeMarketGeneration()
    {
        const player = await StateActivityService.GetPlayer();

        if (!player) {
            return;
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Sell) {
                Storage.AddGoodTo(player.actorId, p.goodId, p.amount);
            }
            if (p.type === CalculatedPriceType.Buy) {
                Storage.AddGoodTo(player.actorId, p.goodId,
                    await Storage.Amount(player.actorId, p.goodId));
            }
        }
    }

    public static async PublishOrders()
    {
        const player = await StateActivityService.GetPlayer();

        if (!player) {
            return;
        }

        if (player.cash <= 10000) {
            await StateActivityService.CreateCash(10000);
        }
        else {
            // Make regular inflation
            await StateActivityService.CreateCash(
                Math.ceil(TurnsService.CurrentTurn.totalcash * Config.EverydayInflation)
            );
        }

        const borders = await BuyOffer.GetWithActor(player.actorId);
        for (const o of borders) {
            await BuyOffer.Delete(o.id);
        }

        const sorders = await SellOffer.GetWithActor(player.actorId);
        for (const o of sorders) {
            await SellOffer.Delete(o.id);
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy) {
                console.log("Created buy order");

                BuyOffer.Create(p.goodId, p.amount, p.price, player.actorId);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell) {
                console.log("Created sell order");

                SellOffer.Create(p.goodId, p.amount, p.price, player.actorId);
                continue;
            }
        }
    }

    public static async AfterMarketCleanup()
    {
        const player = await StateActivityService.GetPlayer();

        if (!player) {
            return;
        }

        const calculatedprices = await CalculatedPrice.GetWithPlayer(player.id);

        for (const p of calculatedprices) {
            if (p.type === CalculatedPriceType.Buy &&
                await Storage.Has(player.actorId, p.goodId, p.amount)) {
                p.price = Math.floor(p.price * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Buy &&
                (await Storage.Amount(player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(player.actorId, p.goodId)) > 0) {
                p.price = Math.floor(p.price * 0.99);
                CalculatedPrice.Update(p);
                continue;
            }
            else if (p.type === CalculatedPriceType.Sell &&
                (await Storage.Amount(player.actorId, p.goodId)) === 0) {
                p.price = Math.ceil(p.price * 1.01);
                CalculatedPrice.Update(p);
                continue;
            }
        }
    }

    public static async AddCash(amount: number)
    {
        const player = await this.GetPlayer();
        player.cash += amount;
        Player.Update(player);
    }

    public static async CreateCash(amount: number)
    {
        this.AddCash(amount);
        TurnsService.RegisterNewCash(amount);
    }
}
