import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";

export class FactoryManagementService
{
    public static async Run(): Promise<void>
    {
        for (const factory of (await Factory.All())) {
            // Pay salaries
            const player = await Player.GetWithFactory(factory);

            const hastopay = factory.salary * factory.employeesCount;

            await player.payCashToState(hastopay);

            Log.LogTemp(`${player.id} paid ${hastopay} salary for ${factory.id}`);
            PlayerService.SendOffline(player.id, `Paid ${hastopay} in salaries`);

            if (player.cash < 0) {
                factory.targetEmployees = this.Lerp(factory.targetEmployees, 0, 0.25);
            }

            // Increase employees count
            if (player.cash > 0 && factory.targetEmployees > factory.employeesCount) {
                let delta = this.Lerp(factory.employeesCount, factory.targetEmployees, 0.75) - factory.employeesCount;
                if (delta < 0) {
                    delta = 1;
                }
                factory.employeesCount += Math.round(delta);

                PlayerService.SendOffline(player.id, `Hired ${delta} workers`);
            }

            if (factory.targetEmployees < factory.employeesCount) {
                const delta = factory.employeesCount - factory.targetEmployees;
                factory.employeesCount = factory.targetEmployees;

                PlayerService.SendOffline(player.id, `Fired ${delta} workers`);
            }

            Factory.Update(factory);
        }
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }
}
