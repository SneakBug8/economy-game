import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import { Config } from "config";
import { Good } from "entity/Good";
import { Storage } from "entity/Storage";
import { PopulationActivityService } from "./PopulationActivityService";
import { Logger } from "utility/Logger";
import { Requisite } from "./Requisites/Requisite";
import { RecipeEntry } from "entity/Recipe";

export class FactoryManagementService
{
    public static async Run()
    {
        for (const factory of (await Factory.All())) {
            // Pay salaries
            const r1 = await Player.GetWithFactory(factory);
            if (!r1.result) {
                return r1;
            }
            const player = r1.data;

            const hastopay = factory.salary * factory.employeesCount;
            let canpay = Math.min(hastopay, await player.AgetCash());

            if (canpay < 0) {
                canpay = 0;
            }

            if (hastopay > canpay) {
                PlayerService.SendOffline(player.id, `Can pay salaries for factory ${factory.id} no more`);
                factory.setTargetEmployees(this.Lerp(factory.getTargetEmployees(), 0, 0.75));
                factory.setTargetEmployees(Math.round(factory.getTargetEmployees()));
            }

            const r2 = await PopulationActivityService.GetPlayer(factory.marketId);
            if (!r2.result) {
                Logger.warn(r2.toString);
                continue;
            }
            await player.payCash(
                r2.data,
                canpay);

            Log.LogTemp(`[Factory] ${player.username} paid ${canpay} salary for ${factory.id}`);
            PlayerService.SendOffline(player.id, `Factory ${factory.id} paid ${canpay} in salaries`);

            // Increase employees count
            if (await player.AgetCash() > 0 && factory.getTargetEmployees() > factory.employeesCount) {
                let delta = this.Lerp(factory.employeesCount,
                    factory.getTargetEmployees(),
                    Config.WorkersRecruitmentSpeed) - factory.employeesCount;
                if (delta < 1) {
                    delta = 1;
                }
                delta = Math.round(delta);
                factory.employeesCount += delta;

                PlayerService.SendOffline(player.id, `Factory ${factory.id} Hired ${delta} workers`);
            }

            if (factory.getTargetEmployees() < factory.employeesCount) {
                let delta = factory.employeesCount - factory.getTargetEmployees();
                delta = Math.round(delta);
                factory.employeesCount = factory.getTargetEmployees();

                PlayerService.SendOffline(player.id, `Factory ${factory.id} fired ${delta} workers`);
            }

            await Factory.Update(factory);
        }

        Logger.info("Ran Factory management service");
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }

    public static async NewFactoryCostsString()
    {
        return await RecipeEntry.toString(Config.NewFactoryCosts);
    }

    public static async ConstructNew(playerid: number, marketId: number)
    {

        const costs = Config.NewFactoryCosts;
        const r1 = await Player.GetById(playerid);
        if (!r1.result) {
            return r1;
        }

        const player = r1.data;

        if (!costs) {
            return new Requisite().error("Can't build factories");
        }

        const factoriescount = (await player.getFactories()).length;

        if (factoriescount >= Config.MaxFactoriesPerPlayer) {
            return new Requisite().error("You can't build more factories");
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.GoodId);

            if (!good) {
                return new Requisite().error("Wrong Factory construction recipe. Contact the admins.");
            }

            if (!await Storage.Has(marketId, player.id, good.id, costentry.Amount)) {
                return new Requisite().error("Not enough resources");
            }
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.GoodId);

            await Storage.TakeGoodFrom(marketId, player.id, good.id, costentry.Amount);
        }

        const factory = await Factory.Create(marketId, player.id, 0, 0);
        return new Requisite(factory);
    }

    public static async UpgradeFactory(playerid: number, factoryid: number)
    {
        const factory = await Factory.GetById(factoryid);

        if (!factory || factory.getOwnerId() !== playerid) {
            return new Requisite().error("That's not your factory");
        }

        const costs = Config.NewFactoryCosts;
        const r1 = await Player.GetById(playerid);
        if (!r1.result) {
            return r1;
        }
        const player = r1.data;

        if (!costs) {
            return new Requisite().error("Can't upgrade factory");
        }

        for (const costentry of costs) {
            const upgradeamount = Math.round(costentry.Amount * Math.pow(1.5, factory.level));

            const good = await Good.GetById(costentry.GoodId);

            if (!good) {
                return "Wrong RGO construction recipe. Contact the admins.";
            }

            if (!await Storage.Has(factory.marketId, player.id, good.id, upgradeamount)) {
                return "Not enough resources";
            }
        }

        for (const costentry of costs) {
            const upgradeamount = Math.round(costentry.Amount * Math.pow(1.5, factory.level));

            const good = await Good.GetById(costentry.GoodId);

            await Storage.TakeGoodFrom(factory.marketId, player.id, good.id, upgradeamount);

        }

        factory.level += 1;
        await Factory.Update(factory);

        return factory;
    }

    public static async GetUpgradeCostString(factoryid: number)
    {
        let res = "";

        const costs = Config.NewFactoryCosts;

        if (!costs) {
            return "Can't upgrade factory";
        }

        const factory = await Factory.GetById(factoryid);

        if (!factory) {
            return "That's not your factory";
        }

        let i = 0;
        for (const costentry of costs) {
            const upgradeamount = Math.round(costentry.Amount * Math.pow(1.5, factory.level));

            const good = await Good.GetById(costentry.GoodId);

            if (!good) {
                return "Wrong RGO construction recipe. Contact the admins.";
            }

            if (costs.length === 1 || i === costs.length - 1) {
                res += `${upgradeamount} ${good.name}`;
            }
            else {
                res += `${upgradeamount} ${good.name}, `;
            }

            i++;
        }

        return res;
    }
}
