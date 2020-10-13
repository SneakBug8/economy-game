import * as assert from "assert";
import "mocha";
import { sleep } from "utility/sleep";
import { Factory } from "Factory";

describe("FactoryTests", () =>
{
    it("Exists", async () =>
    {
        assert.ok(!await Factory.Exists(999), "Exists function works properly");
    });

    it("GetByID", async () =>
    {
        const factory = await Factory.GetById(1);

        assert.ok(factory.id, "ID");
        assert.ok(factory.good_id, "good id");
        assert.ok(factory.salary, "salary");
        assert.ok(factory.employees_count, "employees_count");

        assert.ok(factory.Good, "Good");
    });
});
