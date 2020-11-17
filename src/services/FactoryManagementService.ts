import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import {Config} from "config";
import { Good } from "entity/Good";
import {Storage} from "entity/Storage";

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
                factory.targetEmployees = this.Lerp(factory.targetEmployees, 0, 0.75);
                factory.targetEmployees = Math.round(factory.targetEmployees);
            }

            await player.payCashToState(canpay);

            Log.LogTemp(`Factory ${factory.id} ${player.id} paid ${canpay} salary for ${factory.id}`);
            PlayerService.SendOffline(player.id, `Factory ${factory.id} paid ${canpay} in salaries`);

            // Increase employees count
            if (player.cash > 0 && factory.targetEmployees > factory.employeesCount) {
                let delta = this.Lerp(factory.employeesCount,
                    factory.targetEmployees,
                    Config.WorkersRecruitmentSpeed) - factory.employeesCount;
                if (delta < 1) {
                    delta = 1;
                }
                delta = Math.round(delta);
                factory.employeesCount += delta;

                PlayerService.SendOffline(player.id, `Factory ${factory.id} Hired ${delta} workers`);
            }

            if (factory.targetEmployees < factory.employeesCount) {
                let delta = factory.employeesCount - factory.targetEmployees;
                delta = Math.round(delta);
                factory.employeesCount = factory.targetEmployees;

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

            if (!await Storage.Has(actor, good, costentry.Amount)) {
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
}
