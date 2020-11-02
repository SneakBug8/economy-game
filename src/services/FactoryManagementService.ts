import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";

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

            if (player.cash < 0) {
                factory.targetEmployees = this.Lerp(factory.targetEmployees, factory.employeesCount, 0.25);
            }

            // Increase employees count
            if (player.cash > 0 && factory.targetEmployees > factory.employeesCount) {
                let delta = this.Lerp(factory.employeesCount, factory.targetEmployees, 0.75) - factory.employeesCount;
                if (delta < 0) {
                    delta = 1;
                }
                factory.employeesCount += Math.round(delta);
            }

            if (factory.targetEmployees < factory.employeesCount) {
                factory.employeesCount = factory.targetEmployees;
            }

            Factory.Update(factory);
        }
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }
}
