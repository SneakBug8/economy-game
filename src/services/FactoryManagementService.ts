import { Factory } from "entity/Factory";
import { Player } from "entity/Player";

export class FactoryManagementService
{
    public static async Run(): Promise<void>
    {
        for (const factory of await Factory.All()) {
            // Pay salaries
            const player = await Player.GetWithFactory(factory);

            player.cash -= factory.salary * factory.employeesCount;

            Player.Update(player);

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
