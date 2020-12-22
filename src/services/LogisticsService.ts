import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import { PlayerService } from "./PlayerService";
import { Requisite } from "./Requisites/Requisite";
import { Storage } from "entity/Storage";
import { LogisticsPrice } from "entity/LogisticsPrices";
import { Dice } from "utility/Dice";
import { PlayerLog } from "entity/PlayerLog";

export class LogisticsService
{
    public static async TransferGoodsBetweenMarkets(playerId: number, fromId: number, toId: number, goodId: number, amount: number)
    {
        const r1 = await Player.GetById(playerId);
        if (!r1.result) {
            return r1;
        }
        const player = r1.data;

        if (!await Storage.Has(fromId, player.id, goodId, amount)) {
            return new Requisite().error("Doesn't have these goods to transfer");
        }

        const good = await Good.GetById(goodId);
        if (!good) {
            return new Requisite().error("No such good");
        }

        const toMarket = await Market.GetById(toId);
        if (!toMarket) {
            return new Requisite().error("No market you want to send goods to");
        }

        const road = await LogisticsPrice.GetFromTo(fromId, toId);
        if (!road) {
            return new Requisite().error("No such road to transfer goods by");
        }

        if (road.shipsCost) {
            // Check logistics cost
            const shipsneeded = Math.round(amount * road.shipsCost / 100);
            if (!await Storage.Has(fromId, player.id, LogisticsPrice.TradeShipGoodId, shipsneeded)) {
                return new Requisite().error("Not enough ships to transfer");
            }
            const shipssunk = Dice.Multiple(shipsneeded, road.shipsBreakChance);
            await Storage.AddGoodTo(fromId, player.id, LogisticsPrice.TradeShipGoodId, -shipssunk);
        }
        else if (road.horsesCost) {
            // Check logistics cost
            const horsesneeded = Math.round(amount * road.horsesCost / 100);
            if (!await Storage.Has(fromId, player.id, LogisticsPrice.HorseGoodId, horsesneeded)) {
                return new Requisite().error("Not enough ships to transfer");
            }
            const horseslost = Dice.Multiple(horsesneeded, road.horsesBreakChance);
            await Storage.AddGoodTo(fromId, player.id, LogisticsPrice.HorseGoodId, -horseslost);
        }

        // Transfer goods
        await Storage.AddGoodTo(fromId, player.id, goodId, -amount);
        await Storage.AddGoodTo(toId, player.id, goodId, amount);

        PlayerLog.LogNow(player.id, `Sent ${amount} of ${good.name} to ${toMarket.name}`);

        return new Requisite(true);
    }
}
