import { MarketRepository } from "entity/Market";
import { GoodRepository } from "entity/Good";
import { BuyOfferRepository } from "entity/BuyOffer";
import { SellOfferRepository } from "entity/SellOffer";
import { ConsumptionRepository } from "entity/Consumption";
import { ProductionRepository } from "entity/Production";
import { Good } from "entity/Good";
import { MarketActor } from "entity/MarketActor";
import { StorageRepository } from "entity/Storage";
import { PlayerRepository } from "entity/Player";
import { FactoryRepository } from "entity/Factory";

export class Market
{
    public static async Run(): Promise<void>
    {
        for (const market of await MarketRepository.find()) {
            for (const good of await GoodRepository.find()) {
                const buyoffers = await BuyOfferRepository.find({
                    where: { good }, order: {
                        price: "DESC"
                    }
                });
                const selloffers = await SellOfferRepository.find({
                    where: { good }, order: {
                        price: "ASC"
                    }
                });
                const consumptions = await ConsumptionRepository.find(
                    {
                        where: { good },
                        order: {
                            maxprice: "DESC"
                        }
                    });
                const productions = await ProductionRepository.find({
                    where: { good }, order: {
                        minprice: "ASC"
                    }
                });

                while (buyoffers.length && selloffers.length) {
                    const buy = buyoffers[0];
                    const sell = selloffers[0];

                    if (buy.price >= sell.price) {

                        const transactionsize = Math.min(sell.amount, buy.amount);
                        const transactioncost = transactionsize * sell.price;
                        sell.amount -= transactionsize;
                        buy.amount -= transactionsize;
                        this.TransferCash(sell.MarketActor, transactioncost);
                        this.AddToStorage(buy.MarketActor, good, transactionsize);

                        const extracash = (buy.price - sell.price) * transactionsize;
                        this.TransferCash(buy.MarketActor, extracash);
                        // add buyer goods
                    }
                    else {
                        break;
                    }

                    if (buy.amount === 0) {
                        buyoffers.shift();
                        BuyOfferRepository.remove(buy);
                    }

                    if (sell.amount === 0) {
                        selloffers.shift();
                        SellOfferRepository.remove(sell);
                    }

                }
            }
        }
    }

    public static async AddToStorage(actor: MarketActor, good: Good, amount: number): Promise<void>
    {
        const player = await PlayerRepository.findOne({
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

        if (record) {
            record.amount += amount;
        } else {
            StorageRepository.create({
                Factory: factory,
                Good: good,
                amount,
            });
        }

    }

    public static async RemoveFromStorage(actor: MarketActor, good: Good, amount: number): Promise<boolean>
    {
        const player = await PlayerRepository.findOne({
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
        }

    }

    public static async TransferCash(actor: MarketActor, amount: number): Promise<void>
    {
        const player = await PlayerRepository.findOne({
            where: {
                Actor: actor,
            },
        });

        player.cash += amount;
    }

    public static async PlayerByActor(actor: MarketActor) {
        return await PlayerRepository.findOne({
            where: {
                Actor: actor,
            },
        });
    }


    public static async AddBuyOffer(actor: MarketActor, good: Good, amount: number, price: number) {
        const player = await this.PlayerByActor(actor);

        if (player.cash < amount * price) {
            return;
        }

        this.TransferCash(player.Actor, -amount * price);
        BuyOfferRepository.create({
            Market: await MarketRepository.findOne(1),
            MarketActor: actor,
            Good: good,
            amount,
            price,
        });
    }

    public static async AddSellOffer(actor: MarketActor, good: Good, amount: number, price: number) {
        const player = await this.PlayerByActor(actor);

        const res = await this.RemoveFromStorage(actor, good, amount);

        if (!res) {
            return;
        }

        SellOfferRepository.create({
            Market: await MarketRepository.findOne(1),
            MarketActor: actor,
            Good: good,
            amount,
            price,
        });
    }
}