import * as assert from "assert";
import "mocha";
import { Factory } from "entity/Factory";
import { RecipesService } from "services/RecipesService";
import { Player } from "entity/Player";
import { UsersService } from "services/UsersService";
import { ProductionService } from "services/ProductionService";
import { Storage } from "entity/Storage";
import { Runner } from "Runner";
import { ProductionQueue } from "entity/ProductionQueue";
import { FactoryManagementService } from "services/FactoryManagementService";

describe("FactoryManagement", () =>
{
    it("Pays salaries", async () =>
    {
        Runner.Init();

        const newplayerid = await UsersService.Register("1", "1");
        let player = await Player.GetById(newplayerid);

        const factory = (await player.getFactories())[0];

        const playermoneyprev = player.cash;

        factory.employeesCount = 1;
        factory.salary = 10;

        await Factory.Update(factory);

        await FactoryManagementService.Run();

        player = await Player.GetById(newplayerid);

        const playermoneynew = player.cash;

        assert.ok(playermoneyprev - playermoneynew === factory.employeesCount * factory.salary, "Pays salary");

        await Player.Delete(newplayerid);
    });

    it("Hires workers", async () =>
    {
        Runner.Init();

        const newplayerid = await UsersService.Register("1", "1");
        const player = await Player.GetById(newplayerid);

        let factory = (await player.getFactories())[0];

        const playermoneyprev = player.cash;

        factory.employeesCount = 1;
        factory.targetEmployees = 10;

        const hademployees = 1;

        await Factory.Update(factory);

        await FactoryManagementService.Run();

        factory = await Factory.GetById(factory.id);

        const hasemployees = factory.employeesCount;

        console.log(`Had employyes: ${hademployees}` +
            `Has employees: ${hasemployees}`);

        assert.ok(hasemployees > hademployees, "Hires employees");

        await Player.Delete(newplayerid);
    });
});
