import { Good } from "entity/Good";
import { Market } from "entity/Market";
import { Player } from "entity/Player";
import {Storage} from "entity/Storage";
import { PlayerService } from "./PlayerService";
import { Requisite } from "./Requisites/Requisite";

export class StorageService {
    public static async TransferGoodsBetweenPlayers(marketId: number, fromId: number, toId: number, goodId: number, amount: number) {
        const r1 = await Player.GetById(fromId);
        if (!r1.result) {
            return r1;
        }
        const player = r1.data;

        const good = await Good.GetById(goodId);
        if (!good) {
            return new Requisite().error("No such good");
        }

        if (!await Storage.Has(fromId, player.id, goodId, amount)) {
            return new Requisite().error("Doesn't have these goods to transfer");
        }

        const r2 = await Player.GetById(toId);
        if (!r2.result) {
            return r2;
        }
        const receiverplayer = r2.data;

        await Storage.AddGoodTo(marketId, player.id, goodId, -amount);
        await Storage.AddGoodTo(marketId, receiverplayer.id, goodId, amount);

        PlayerService.SendOffline(receiverplayer.id, `Received ${amount} of ${good.name} from ${player.username}`);

        return new Requisite(true);
    }
}