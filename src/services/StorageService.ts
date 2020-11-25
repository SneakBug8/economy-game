import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import {Storage} from "entity/Storage";
import { PlayerService } from "./PlayerService";

export class StorageService {
    public static async TransferGoodsBetweenMarkets(playerId: number, fromId: number, toId: number, goodId: number, amount: number) {
        const player = await Player.GetById(playerId);

        if (!player) {
            return "No such sender";
        }

        if (!Storage.Has(fromId, player.id, goodId, amount)) {
            return "Doesn't have these goods to transfer";
        }

        const good = await Good.GetById(goodId);
        if (!good) {
            return "No such good";
        }

        const toMarket = await Market.GetById(toId);
        if (!toMarket) {
            return "No market you want to send goods to";
        }

        await Storage.AddGoodTo(fromId, player.id, goodId, -amount);
        await Storage.AddGoodTo(toId, player.id, goodId, amount);

        PlayerService.SendOffline(player.id, `Sent ${amount} of ${good.name} to ${toMarket.name}`);

        return true;
    }

    public static async TransferGoodsBetweenPlayers(marketId: number, fromId: number, toId: number, goodId: number, amount: number) {
        const player = await Player.GetById(fromId);

        if (!player) {
            return "No such sender";
        }

        const good = await Good.GetById(goodId);
        if (!good) {
            return "No such good";
        }

        if (!Storage.Has(fromId, player.id, goodId, amount)) {
            return "Doesn't have these goods to transfer";
        }

        const receiverplayer = await Player.GetById(toId);

        if (!receiverplayer) {
            return "No such player exist";
        }

        await Storage.AddGoodTo(marketId, player.id, goodId, -amount);
        await Storage.AddGoodTo(marketId, receiverplayer.id, goodId, amount);

        PlayerService.SendOffline(receiverplayer.id, `Received ${amount} of ${good.name} from ${player.username}`);

        return true;
    }
}