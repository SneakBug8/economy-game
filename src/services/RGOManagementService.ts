import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import { RGO } from "entity/RGO";
import { Config } from "config";
import {Storage} from "entity/Storage";
import { Good } from "entity/Good";
import { RGOType } from "entity/RGOType";
import { Logger } from "utility/Logger";
import { RGOMarketToType } from "entity/RGOMarketToType";

export class RGOManagementService
{
    public static async Run(): Promise<void>
    {
        for (const rgo of (await RGO.All())) {
            // Pay salaries
            const r1 = await rgo.getOwner();
            if (!r1.result) {
                Logger.warn(r1.toString());
                continue;
            }
            const player = r1.data;

            const hastopay = rgo.salary * rgo.employeesCount;
            let canpay = Math.min(hastopay, await player.AgetCash());

            if (canpay < 0) {
                canpay = 0;
            }

            if (hastopay > canpay) {
                PlayerService.SendOffline(player.id, `Can pay salaries for RGO ${rgo.id} no more`);
                rgo.setTargetEmployees(
                    Math.round(this.Lerp(rgo.getTargetEmployees(), 0, 0.75))
                    );
            }

            await player.payCashToState(rgo.marketId, canpay);

            PlayerService.SendOffline(player.id, `RGO ${rgo.id} paid ${canpay} in salaries`);

            // Increase employees count
            if (await player.AgetCash() > 0 && rgo.getTargetEmployees() > rgo.employeesCount) {
                let delta = this.Lerp(rgo.employeesCount,
                    rgo.getTargetEmployees(),
                    Config.WorkersRecruitmentSpeed) - rgo.employeesCount;
                if (delta < 1) {
                    delta = 1;
                }
                delta = Math.round(delta);
                rgo.employeesCount += delta;

                PlayerService.SendOffline(player.id, `RGO ${rgo.id} hired ${delta} workers`);
            }

            if (rgo.getTargetEmployees() < rgo.employeesCount) {
                let delta = rgo.employeesCount - rgo.getTargetEmployees();
                delta = Math.round(delta);
                rgo.employeesCount = rgo.getTargetEmployees();

                PlayerService.SendOffline(player.id, `RGO ${rgo.id} fired ${delta} workers`);
            }

            await RGO.Update(rgo);
        }

        Logger.info("Ran RGO Management service");
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }

    public static async NewRGOCostsString(typeId: number) {
        let costs = Config.RGOCostsDictionary.get(typeId);

        if (!costs) {
            costs = Config.DefaultRGOCosts;
        }

        let res = "";
        let i = 0;
        for (const cost of costs) {
            const good = await Good.GetById(cost.GoodId);
            if (costs.length === 1 || i === costs.length - 1) {
                res += `${cost.Amount} ${good.name}`;
            }
            else {
                res += `${cost.Amount} ${good.name}, `;
            }
            i++;
        }

        return res;
    }

    public static async ConstructNew(playerid: number, rgotypeid: number) {
        const rgotype = await RGOType.GetById(rgotypeid);
        if (!rgotype) {
            return "No such RGO type";
        }

        const r1 = await Player.GetById(playerid);
        if (!r1.data) {
            return r1;
        }
        const player = r1.data;

        const link = await RGOMarketToType.GetMarketTypeLink(player.CurrentMarketId, rgotypeid);

        if (!link) {
            return "Can't build this in this region";
        }

        const costs = Config.RGOCostsDictionary.get(rgotypeid);

        if (!costs) {
            return "Can't build such RGO";
        }

        const currcount = await RGO.CountWithType(player.CurrentMarketId, rgotypeid);

        if (currcount >= link.maxAmount) {
            return "No free slots for this RGO";
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.GoodId);

            if (!good) {
                return "Wrong RGO construction recipe. Contact the admins.";
            }

            if (!await Storage.Has(player.CurrentMarketId, player.id, good.id, costentry.Amount)) {
                return "Not enough resources";
            }
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.GoodId);

            await Storage.TakeGoodFrom(player.CurrentMarketId, player.id, good.id, costentry.Amount);
        }

        const rgo = await RGO.Create(player.CurrentMarketId, player.id, 0, 0, rgotypeid);
        return rgo;
    }

    public static async UpgradeRGO(playerid: number, rgoid: number) {
        const rgo = await RGO.GetById(rgoid);

        if (!rgo || rgo.getOwnerId() !== playerid ) {
            return "That's not your RGO";
        }

        const rgotype = await rgo.getType();
        if (!rgotype) {
            return "No such RGO type";
        }

        const costs = Config.RGOCostsDictionary.get(rgotype.id);
        const r1 = await Player.GetById(playerid);
        if (!r1.result) {
            return r1;
        }
        const player = r1.data;

        if (!costs) {
            return "Can't upgrade RGO";
        }

        for (const costentry of costs) {
            const upgradeamount = costentry.Amount * Math.pow(1.5, rgo.level);

            const good = await Good.GetById(costentry.GoodId);

            if (!good) {
                return "Wrong RGO construction recipe. Contact the admins.";
            }

            if (!await Storage.Has(rgo.marketId, player.id, good.id, upgradeamount)) {
                return "Not enough resources";
            }
        }

        for (const costentry of costs) {
            const upgradeamount = costentry.Amount * Math.pow(1.5, rgo.level);

            const good = await Good.GetById(costentry.GoodId);

            await Storage.TakeGoodFrom(rgo.marketId, player.id, good.id, upgradeamount);

        }

        rgo.level += 1;
        await RGO.Update(rgo);

        return rgo;
    }

    public static async Destroy(playerid: number, rgoid: number) {
        const rgo = await RGO.GetById(rgoid);

        if (!rgo) {
            return "No such RGO";
        }

        if (rgo.getOwnerId() !== playerid) {
            return "That's not your rgo";
        }

        await RGO.Delete(rgo.id);
        return true;
    }
}
