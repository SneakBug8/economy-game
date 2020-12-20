import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Good, GoodRepository } from "entity/Good";
import { Player } from "entity/Player";
import { Storage } from "entity/Storage";
import { Market } from "entity/Market";
import { EventsList } from "events/EventsList";
import { TradeEventType } from "events/types/TradeEvent";
import { PlayerService } from "./PlayerService";
import { Config } from "config";
import { Logger } from "utility/Logger";
import { Connection } from "DataBase";
import { RSA_SSLV23_PADDING } from "constants";
import { Requisite } from "./Requisites/Requisite";

export class MarketService
{
    public static async Init(): Promise<void>
    {
        Market.DefaultMarket = await Market.GetById(1);
    }

    public static async Run()
    {
        await EventsList.beforeMarket.emit();

        for (const market of await Market.All()) {
            for (const good of await this.GetTradeableGoods()) {

                const buyoffers = await BuyOffer.GetWithGoodAndMarket(market.id, good.id);
                const selloffers = await SellOffer.GetWithGoodAndMarket(market.id, good.id);

                let b = 0;
                let s = 0;

                let i = 0;

                // Offers vs offers
                while (buyoffers.length && selloffers.length && i < 1000) {
                    i++;

                    const buy = buyoffers[b];
                    const sell = selloffers[s];

                    if (buy.playerId === sell.playerId) {
                        if (b < buyoffers.length - 1) {
                            b++;
                        }
                        else if (s < selloffers.length - 1) {
                            s++;
                        }
                        else {
                            buyoffers.shift();
                            BuyOffer.Delete(buy.id);
                        }

                        continue;
                    }

                    b = 0;
                    s = 0;

                    if (buy.price >= sell.price) {
                        const r1 = await Player.GetById(buy.playerId);
                        if (!r1.result) {
                            Logger.warn(r1.toString());
                            continue;
                        }
                        const buyerplayer = r1.data;
                        const r2 = await Player.GetById(sell.playerId);
                        if (!r2.result) {
                            Logger.warn(r2.toString());
                            continue;
                        }
                        const sellerplayer = r2.data;

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;

                        if (!await Player.HasCash(buyerplayer.id, transactioncost)) {
                            buyoffers.shift();
                            BuyOffer.Delete(buy.id);
                            continue;
                        }

                        if (transactionsize < 1) {
                            return;
                        }

                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;

                        // Take taxes for market trading from seller
                        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);

                        await this.TransferCash(buyerplayer.id, sellerplayer.id, transactioncost - taxcost);
                        await buyerplayer.payCashToState(buy.marketId, taxcost);
                        await Storage.AddGoodTo(buy.marketId, buyerplayer.id, good.id, transactionsize);

                        PlayerService.SendOffline(sellerplayer.id,
                            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyerplayer.username} at ${market.name}, tax: ${taxcost}`);
                        PlayerService.SendOffline(buyerplayer.id,
                            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username} at ${market.name}. tax: ${taxcost}`);

                        await EventsList.onTrade.emit({
                            Type: TradeEventType.ToPlayer,
                            Player: sellerplayer,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                        await EventsList.onTrade.emit({
                            Type: TradeEventType.FromPlayer,
                            Player: buyerplayer,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }
                    else {
                        BuyOffer.Update(buy);
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }
                    else {
                        SellOffer.Update(sell);
                    }
                }
                /*
                // Buyers vs production
                while (buyoffers.length && productions.length) {
                    const buy = buyoffers[0];
                    const production = productions[0];
                    const buyactor = await buy.getActor();

                    if (buy.price >= production.minprice) {
                        const transactionsize = Math.min(buy.amount, production.amount);
                        const transactioncost = transactionsize * buy.price;

                        const buyerplayer = await Player.GetWithActor(buyactor);

                        if (buyerplayer.cash < transactioncost || transactionsize < 1) {
                            return;
                        }

                        const transactionres = await buyerplayer.payCashToState(transactioncost);
                        if (!transactionres) {
                            return;
                        }

                        buy.amount -= transactionsize;
                        production.amount -= transactionsize;

                        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

                        PlayerService.SendOffline(buyerplayer.id,
                            `Bought ${transactionsize} ${good.name} for ${transactioncost} from State`);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.FromGovernment,
                            Actor: buyactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: buy.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOffer.Delete(buy.id);
                    }
                    else {
                        BuyOffer.Update(buy);
                    }

                    if (production.amount === 0) {
                        productions.shift();
                    }
                }

                // Sellers vs consumption
                while (selloffers.length && consumptions.length) {
                    const sell = selloffers[0];
                    const consumption = consumptions[0];

                    const sellactor = await sell.getActor();
                    const sellerplayer = await Player.GetWithActor(sellactor);

                    if (sell.price <= consumption.maxprice) {
                        const transactionsize = Math.min(sell.amount, consumption.amount);
                        const transactioncost = transactionsize * sell.price;

                        sell.amount -= transactionsize;
                        consumption.amount -= transactionsize;

                        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
                        await sellerplayer.takeCashFromState(transactioncost - taxcost);

                        PlayerService.SendOffline(sellerplayer.id,
                            `Sold ${transactionsize} ${good.name} for ${transactioncost} to State, tax: ${taxcost}`);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.ToGovernment,
                            Actor: sellactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                    }
                    else {
                        break;
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }
                    else {
                        SellOffer.Update(sell);
                    }

                    if (consumption.amount === 0) {
                        consumptions.shift();
                    }
                }
                */

            }

        }
        Logger.info("Ran market service");

        await EventsList.afterMarket.emit();
    }

    /*public static async AddToStorage(actor: MarketActor): Promise<void>
    {
        const player = await Player.GetWithActor(actor.id);

        /*const record = await StorageRepository.findOne({
            where: {
                Factory: factory,
                Good: good,
            },
        });

        if (record) {
            record.amount += amount;
        } else {
            StorageRepository.create({
                Factory: factory,
                Good: good,
                amount,
            });
        }*/

    //}
    /*
        public static async RemoveFromStorage(): Promise<boolean>
        {
            return false;
            /*const player = await PlayerRepository.findOne({
                where: {
                    Actor: actor,
                },
            });

            const factory = player.Factory;

            const record = await StorageRepository.findOne({
                where: {
                    Factory: factory,
                    Good: good,
                },
            });

            if (!record || record.amount < amount) {
                return false;
            } else {
                record.amount -= amount;
            }*/

    //}*/

    public static async TransferCash(fromId: number, toId: number, amount: number)
    {
        const playerfrom = await Player.GetById(fromId);
        const playerto = await Player.GetById(toId);

        if (!playerfrom.result) {
            return playerfrom;
        }

        if (!playerto.result) {
            return playerto;
        }

        return await playerfrom.data.payCash(playerto.data, amount);
    }

    public static async RedeemSellOffer(buyPlayerId: number, sellOfferId: number, size?: number)
    {
        const sellOffer = await SellOffer.GetById(sellOfferId);
        if (!sellOffer) {
            return "No such sell offer";
        }

        if (buyPlayerId === sellOffer.playerId) {
            return "Can't trade with yourself";
        }

        const r1 = await Player.GetById(buyPlayerId);
        const r2 = await Player.GetById(sellOffer.playerId);

        if (!r1.result) {
            return r1;
        }

        if (!r2.result) {
            return r2;
        }

        const sellerplayer = r2.data;
        const buyplayer = r1.data;

        if (sellOffer.marketId !== buyplayer.CurrentMarketId) {
            return "You are in different markets";
        }

        const market = await Market.GetById(sellOffer.marketId);

        let transactionsize = sellOffer.amount;
        if (size) {
            transactionsize = Math.min(sellOffer.amount, size);
        }
        const transactioncost = transactionsize * sellOffer.price;

        if (await buyplayer.AgetCash() < transactioncost) {
            return "Not enough cash";
        }

        const good = await sellOffer.getGood();

        sellOffer.amount -= transactionsize;

        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
        await buyplayer.payCash(sellerplayer, transactioncost - taxcost);
        await buyplayer.payCashToState(sellOffer.marketId, taxcost);
        await Storage.AddGoodTo(sellOffer.marketId, buyplayer.id, good.id, transactionsize);

        PlayerService.SendOffline(sellerplayer.id,
            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyplayer.username} at ${market.name}, tax: ${taxcost}`);
        PlayerService.SendOffline(buyplayer.id,
            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username} at ${market.name}. tax: ${taxcost}`);

        await EventsList.onTrade.emit({
            Type: TradeEventType.ToPlayer,
            Player: sellerplayer,
            Good: good,
            Amount: transactionsize,
            Price: sellOffer.price,
        });
        await EventsList.onTrade.emit({
            Type: TradeEventType.FromPlayer,
            Player: buyplayer,
            Good: good,
            Amount: transactionsize,
            Price: sellOffer.price,
        });

        if (sellOffer.amount === 0) {
            SellOffer.Delete(sellOffer.id);
        }
        else {
            SellOffer.Update(sellOffer);
        }
    }

    public static async RedeemBuyOffer(sellPlayerId: number, buy: SellOffer, size: number = null)
    {
        if (buy.playerId === sellPlayerId) {
            return new Requisite().error("Can't trade with yourself");
        }

        const r1 = await Player.GetById(sellPlayerId);
        if (!r1.result) {
            return r1;
        }
        const sellerplayer = r1.data;

        const r2 = await Player.GetById(buy.playerId);
        if (!r2.result) {
            return r2;
        }
        const buyplayer = r2.data;

        if (!sellerplayer || !buyplayer) {
            return new Requisite().error("No such buyer or seller");
        }

        if (buy.marketId !== sellerplayer.CurrentMarketId) {
            return new Requisite().error("You are in different markets");
        }

        const market = await Market.GetById(buy.marketId);

        let transactionsize = buy.amount;
        if (size) {
            transactionsize = Math.min(buy.amount, size);
        }
        const transactioncost = transactionsize * buy.price;

        const good = await buy.getGood();

        if (await buyplayer.AgetCash() < transactioncost) {
            return new Requisite().error("Buyer doesn't have enough cash");
        }

        if (!Storage.Has(buy.marketId, sellerplayer.id, good.id, transactionsize)) {
            return new Requisite().error("Not enough resources");
        }

        buy.amount -= transactionsize;

        const taxcost = Math.round(transactioncost * Config.MarketTaxPercent);
        await buyplayer.payCash(sellerplayer, transactioncost - taxcost);
        await buyplayer.payCashToState(buy.marketId, taxcost);
        await Storage.AddGoodTo(buy.marketId, buyplayer.id, good.id, transactionsize);

        PlayerService.SendOffline(sellerplayer.id,
            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyplayer.username} at ${market.name}, tax: ${taxcost}`);
        PlayerService.SendOffline(buyplayer.id,
            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username} at ${market.name}. tax: ${taxcost}`);

        await EventsList.onTrade.emit({
            Type: TradeEventType.ToPlayer,
            Player: sellerplayer,
            Good: good,
            Amount: transactionsize,
            Price: buy.price,
        });
        await EventsList.onTrade.emit({
            Type: TradeEventType.FromPlayer,
            Player: buyplayer,
            Good: good,
            Amount: transactionsize,
            Price: buy.price,
        });


        if (buy.amount === 0) {
            await BuyOffer.Delete(buy.id);
        }
        else {
            await BuyOffer.Update(buy);
        }
    }

    public static async AddBuyOffer(marketId: number,
        playerId: number, goodId: number, amount: number, price: number)
    {
        return await BuyOffer.Create(marketId, goodId, amount, price, playerId);
    }

    public static async AddSellOffer(marketId: number,
        playerId: number, goodId: number, amount: number, price: number)
    {
        return await SellOffer.Create(marketId, goodId, amount, price, playerId);
    }

    public static async CountDemandGlobal(goodId: number)
    {
        let demand = 0;
        const offers = await BuyOffer.GetWithGood(goodId);

        for (const entry of offers) {
            demand += entry.amount;
        }
        return demand;
    }

    public static async CountDemandLocal(goodId: number, marketId: number)
    {
        let demand = 0;
        const offers = (await BuyOffer.GetWithGood(goodId)).filter((x) => x.marketId === marketId);

        for (const entry of offers) {
            demand += entry.amount;
        }
        return demand;
    }

    public static async CountSupplyGlobal(goodId: number)
    {
        let supply = 0;
        const offers = await SellOffer.GetWithGood(goodId);

        for (const entry of offers) {
            supply += entry.amount;
        }

        return supply;
    }

    public static async CountSupplyLocal(goodId: number, marketId: number)
    {
        let supply = 0;
        const offers = (await SellOffer.GetWithGood(goodId)).filter((x) => x.marketId === marketId);

        for (const entry of offers) {
            supply += entry.amount;
        }

        return supply;
    }

    public static async GetTradeableGoods()
    {
        const data = await Connection.raw("select * from goods where id not in (select goodId from Currencies);");

        return Good.UseQuery(data);
    }

    public static async GetCurrencies()
    {
        const data = await Connection.raw("select * from goods where id in (select goodId from Currencies);");

        return Good.UseQuery(data);
    }
}