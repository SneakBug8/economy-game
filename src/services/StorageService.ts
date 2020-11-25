import { Player } from "entity/Player";
import {Storage} from "entity/Storage";

export class StorageService {
    public static async TransferGoodsBetweenMarkets(playerId: number, fromId: number, toId: number, goodId: number, amount: number) {
        const player = await Player.GetById(playerId);

        if (!player) {
            return "No such sender";
        }

        if (!Storage.Has(fromId, player.id, goodId, amount)) {
            return "Doesn't have these goods to transfer";
        }

        await Storage.AddGoodTo(fromId, player.id, goodId, -amount);
        await Storage.AddGoodTo(toId, player.id, goodId, amount);

        return true;
    }

    public static async TransferGoodsBetweenPlayers(marketId: number, fromId: number, toId: number, goodId: number, amount: number) {
        const player = await Player.GetById(fromId);

        if (!player) {
            return "No such sender";
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

        return true;
    }
}