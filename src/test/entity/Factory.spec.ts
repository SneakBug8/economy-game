import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { Factory } from "entity/Factory";

let lastid = 1;

describe("FactoryTests", () =>
{

    it("Exists", async () =>
    {
        assert.ok(!await Factory.Exists(999), "Exists function works properly");
    });

    it("Add", async () =>
    {
        const factory = new Factory();
        factory.salary = 1;
        factory.employeesCount = 1;

        const res = await Factory.Insert(factory);

        assert.ok(res, "Insert res id");

        lastid = res;
    });

    it("GetByID", async () =>
    {
        const factory = await Factory.GetById(lastid);

        assert.ok(factory.id, "ID");
        assert.ok(factory.salary, "salary");
        assert.ok(factory.employeesCount, "employees_count");
    });

    it("All", async () =>
    {
        const good = await Factory.All();

        assert.ok(good.length, "count");
        assert.ok(good[0].id, "ID");
    });

    it("Delete", async () =>
    {
        await Factory.Delete(lastid);

        const res = await Factory.Exists(lastid);
        assert.ok(!res, "Deleted player");
    });
});
