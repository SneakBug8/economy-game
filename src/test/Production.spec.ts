import * as assert from "assert";
import "mocha";
import { Production } from "engine/Production";
import { FactoryRepository, Factory } from "entity/Factory";
import { MarketActor, MarketActorRepository } from "entity/MarketActor";
import { Player, PlayerRepository } from "entity/Player";

let factory: Factory;
let actor: MarketActor;
let player: Player;

console.log("test");

describe("ProductionTests", () =>
{
    it("Weird import", async () => {
        require("../entity/BuyOffer");
    });
    it("Create Factory", async () => {
        factory = new Factory();
        actor = new MarketActor();
        player = new Player();
        player.Factory = factory;
        player.Actor = actor;
        player.username = "loh";
        player.password = "2020";

        await FactoryRepository.save(factory);
        await MarketActorRepository.save(actor);
        await PlayerRepository.save(player);
    });
    it("Set Production", async () => {
        factory.RecipeId = 1;
        await FactoryRepository.save(factory);
    });
    it("Production", async () => {
        Production.Run();
    });
    it("Delete Factory", async () => {
        await PlayerRepository.delete(player);
        await FactoryRepository.delete(factory);
        await MarketActorRepository.delete(actor);
    });
});
