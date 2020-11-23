import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import {Config} from "config";
import { Good } from "entity/Good";
import {Storage} from "entity/Storage";
import { PopulationActivityService } from "./PopulationActivityService";

export class FactoryManagementService
{
    public static async Run(): Promise<void>
    {
        for (const factory of (await Factory.All())) {
            // Pay salaries
            const player = await Player.GetWithFactory(factory);

            const hastopay = factory.salary * factory.employeesCount;
            const canpay = Math.min(hastopay, player.cash);

            if (player.cash < 0 || hastopay > canpay) {
                PlayerService.SendOffline(player.id, `Can pay salaries for factory ${factory.id} no more`);
                factory.setTargetEmployees(this.Lerp(factory.getTargetEmployees(), 0, 0.75));
                factory.setTargetEmployees(Math.round(factory.getTargetEmployees()));
            }

            await player.payCash(await PopulationActivityService.GetPlayer(), canpay);

            Log.LogTemp(`[Factory] ${player.username} paid ${canpay} salary for ${factory.id}`);
            PlayerService.SendOffline(player.id, `Factory ${factory.id} paid ${canpay} in salaries`);

            // Increase employees count
            if (player.cash > 0 && factory.getTargetEmployees() > factory.employeesCount) {
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
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }

    public static async ConstructNew(playerid: number) {

        const costs = Config.NewFactoryCosts;
        const player = await Player.GetById(playerid);
        const actor = await player.getActor();

        if (!costs) {
            return "Can't build factories";
        }

        const factoriescount = (await player.getFactories()).length;

        if (factoriescount >= Config.MaxFactoriesPerPlayer) {
            return "You can't build more factories";
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.goodId);

            if (!good) {
                return "Wrong Factory construction recipe. Contact the admins.";
            }

            if (!await Storage.Has(actor.id, good.id, costentry.Amount)) {
                return "Not enough resources";
            }
        }

        for (const costentry of costs) {
            const good = await Good.GetById(costentry.goodId);

            await Storage.TakeGoodFrom(actor, good, costentry.Amount);
        }

        const factory = await Factory.Create(player, 0, 0);
        return factory;
    }

    public static async UpgradeFactory(playerid: number, factoryid: number) {
        const factory = await Factory.GetById(factoryid);

        if (!factory || factory.getOwnerId() !== playerid ) {
            return "That's not your factory";
        }

        const costs = Config.NewFactoryCosts;
        const player = await Player.GetById(playerid);
        const actor = await player.getActor();

        if (!costs) {
            return "Can't upgrade factory";
        }

        for (const costentry of costs) {
            const upgradeamount = costentry.Amount * Math.pow(1.5, factory.level);

            const good = await Good.GetById(costentry.goodId);

            if (!good) {
                return "Wrong RGO construction recipe. Contact the admins.";
            }

            if (!await Storage.Has(actor.id, good.id, upgradeamount)) {
                return "Not enough resources";
            }
        }

        for (const costentry of costs) {
            const upgradeamount = costentry.Amount * Math.pow(1.5, factory.level);

            const good = await Good.GetById(costentry.goodId);

            await Storage.TakeGoodFrom(actor, good, upgradeamount);

        }

        factory.level += 1;
        await Factory.Update(factory);

        return factory;
    }
}
