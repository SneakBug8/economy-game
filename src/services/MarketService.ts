import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { Player } from "entity/Player";
import { Storage } from "entity/Storage";
import { Consumption } from "entity/Consumption";
import { Production } from "entity/Production";
import { TurnsService } from "./TurnsService";
import { Market } from "entity/Market";
import { PriceRecord } from "entity/PriceRecord";
import { EventsList } from "events/EventsList";
import { ITradeEvent, TradeEventType } from "events/types/TradeEvent";
import { PlayerService } from "./PlayerService";
import { Config } from "config";

export class MarketService
{
    public static async Init(): Promise<void>
    {
        Market.DefaultMarket = await Market.GetById(1);
    }

    public static async Run(): Promise<void>
    {

        for (const market of await Market.All()) {
            for (const good of await Good.All()) {

                this.getRecord(good);

                const buyoffers = await BuyOffer.GetWithGoodOrdered(good);
                const selloffers = await SellOffer.GetWithGoodOrdered(good);

                const consumptions = await Consumption.GetWithGood(good);
                const productions = await Production.GetWithGood(good);

                // Offers vs offers
                while (buyoffers.length && selloffers.length) {
                    const buy = buyoffers[0];
                    const sell = selloffers[0];

                    if (buy.price >= sell.price) {
                        const buyactor = await buy.getActor();
                        const sellactor = await sell.getActor();
                        const buyerplayer = await Player.GetWithActor(buyactor);
                        const sellerplayer = await Player.GetWithActor(sellactor);

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

                        await this.TransferCash(buyactor, sellactor, transactioncost - taxcost);
                        await buyerplayer.payCashToState(taxcost);
                        await Storage.AddGoodTo(buyactor.id, good.id, transactionsize);

                        PlayerService.SendOffline(sellerplayer.id,
                            `Sold ${transactionsize} ${good.name} for ${transactioncost} to ${buyerplayer.username}, tax: ${taxcost}`);
                        PlayerService.SendOffline(buyerplayer.id,
                            `Bought ${transactionsize} ${good.name} for ${transactioncost} from ${sellerplayer.username}. tax: ${taxcost}`);

                        this.appendToRecords(good, sell.price, transactionsize);

                        EventsList.onTrade.emit({
                            Type: TradeEventType.ToPlayer,
                            Actor: sellactor,
                            Good: good,
                            Amount: transactionsize,
                            Price: sell.price,
                        });
                        EventsList.onTrade.emit({
                            Type: TradeEventType.FromPlayer,
                            Actor: buyactor,
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

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOffer.Delete(sell.id);
                    }

                }

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

                        this.appendToRecords(good, buy.price, transactionsize);

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

                        this.appendToRecords(good, sell.price, transactionsize);

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

                    if (consumption.amount === 0) {
                        consumptions.shift();
                    }
                }

            }

        }

        await this.commitRecords();
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

    public static async TransferCash(from: MarketActor, to: MarketActor, amount: number): Promise<void>
    {
        const playerfrom = await Player.GetWithActor(from);
        const playerto = await Player.GetWithActor(to);

        playerfrom.payCash(playerto, amount);
    }

    public static async AddBuyOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        return await BuyOffer.Create(good, amount, price, actor);
    }

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number, price: number)
    {
        return await SellOffer.Create(good, amount, price, actor);
    }

    private static records: PriceRecord[] = [];

    private static async commitRecords()
    {
        for (const record of this.records) {
            await PriceRecord.Create(TurnsService.CurrentTurn.id, record.goodId, record.minprice, record.maxprice, record.tradeamount);
        }

        this.records = [];
    }

    private static appendToRecords(good: Good, price: number, amount: number)
    {
        const record = this.getRecord(good);
        if (price < record.minprice) {
            record.minprice = price;
        }
        if (price > record.maxprice) {
            record.maxprice = price;
        }

        if (amount) {
            record.tradeamount += amount;
        }
    }

    private static getRecord(good: Good)
    {
        for (const record of this.records) {
            if (record.goodId === good.id) {
                return record;
            }
        }

        const newrecord = {
            goodId: good.id,
            minprice: Number.MAX_SAFE_INTEGER,
            maxprice: 0,
            tradeamount: 0,
        };

        this.records.push(newrecord);

        return newrecord;
    }
}