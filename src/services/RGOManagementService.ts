import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { TurnsService } from "./TurnsService";
import { Log } from "entity/Log";
import { PlayerService } from "./PlayerService";
import { RGO } from "entity/RGO";

export class RGOManagementService
{
    public static async Run(): Promise<void>
    {
        for (const rgo of (await RGO.All())) {
            // Pay salaries
            const player = await rgo.getOwner();

            const hastopay = rgo.salary * rgo.employeesCount;
            const canpay = Math.max(hastopay, player.cash);

            if (player.cash < 0 || hastopay > canpay) {
                PlayerService.SendOffline(player.id, `Can pay salaries for RGO ${rgo.id} no more`);
                rgo.targetEmployees = this.Lerp(rgo.targetEmployees, 0, 0.75);
            }

            await player.payCashToState(canpay);

            Log.LogTemp(`${player.id} paid ${canpay} salary for ${rgo.id}`);
            PlayerService.SendOffline(player.id, `Paid ${canpay} in salaries`);

            // Increase employees count
            if (player.cash > 0 && rgo.targetEmployees > rgo.employeesCount) {
                let delta = this.Lerp(rgo.employeesCount, rgo.targetEmployees, 0.75) - rgo.employeesCount;
                if (delta < 0) {
                    delta = 1;
                }
                rgo.employeesCount += Math.round(delta);

                PlayerService.SendOffline(player.id, `Hired ${delta} workers`);
            }

            if (rgo.targetEmployees < rgo.employeesCount) {
                const delta = rgo.employeesCount - rgo.targetEmployees;
                rgo.employeesCount = rgo.targetEmployees;

                PlayerService.SendOffline(player.id, `Fired ${delta} workers`);
            }

            await RGO.Update(rgo);
        }
    }

    public static Lerp(start: number, end: number, percent: number)
    {
        return (start + percent * (end - start));
    }
}
