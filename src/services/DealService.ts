import { Deal, DealsRepository } from "entity/Deal";
import { Good } from "entity/Good";
import { Player } from "entity/Player";

export class DealService
{
    public static async Create(marketId: number, fromId: number, toId: number)
    {
        return await Deal.Create(marketId, fromId, toId);
    }

    public static async RemoveGood(dealId: number, playerId: number, goodId: number)
    {
        const deal = await Deal.GetById(dealId);
        return await deal.removeGood(playerId, goodId);
    }

    public static async AddGood(dealId: number, playerId: number, goodId: number, amount: number)
    {
        const deal = await Deal.GetById(dealId);
        return await deal.addGood(playerId, goodId, amount);
    }

    public static async Confirm(dealId: number, playerId: number)
    {
        const deal = await Deal.GetById(dealId);
        return await deal.confirm(playerId);
    }

    public static async Revert(dealId: number)
    {
        const deal = await Deal.GetById(dealId);
        return await deal.revert();
    }

    public static async Commit(dealId: number)
    {
        const deal = await Deal.GetById(dealId);
        return deal.commit();
    }

    public static async GetAnotherPlayerId(deal: Deal, firstPlayerId: number)
    {
        return (firstPlayerId === deal.fromId) ? deal.toId : deal.fromId;
    }

    public static async GetAnotherPlayerName(deal: Deal, firstPlayerId: number)
    {
        let player: Player = null;
        if (firstPlayerId === deal.fromId) {
            player = await Player.GetById(deal.toId);
        }
        else if (firstPlayerId === deal.toId) {
            player = await Player.GetById(deal.fromId);
        }

        if (player) {
            return player.username;
        }
        else {
            return null;
        }
    }

    public static async EnsureOwnDeal(deal: Deal, playerId: number)
    {
        return deal.toId === playerId || deal.fromId === playerId;
    }

    public static async LoadGoods(deal: Deal, playerId: number)
    {
        const res = new Map();

        if (playerId === deal.fromId) {
            for (const fromkeyvalue of deal.FromGoods) {
                const good = await Good.GetById(fromkeyvalue[0]);

                if (!good) {
                    return "No such good";
                }

                res.set(good, fromkeyvalue[1]);
            }
        }
        else if (playerId === deal.toId) {
            for (const tokeyvalue of deal.ToGoods) {
                const good = await Good.GetById(tokeyvalue[0]);

                if (!good) {
                    return "No such good";
                }

                res.set(good, tokeyvalue[1]);
            }
        }
        else {
            return "Wrong player";
        }

        return res;
    }
}