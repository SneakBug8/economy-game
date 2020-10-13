import "engine/Turns";
import "engine/Market";
import "engine/Production";
import "engine/Users";
import { Turns } from "engine/Turns";
import { Recipes } from "engine/Recipes";
import { Production } from "engine/Production";
import { Market } from "engine/Market";

export class Runner {
    public static async Turn() {
        Turns.Init();
        Recipes.Init();

        Production.Run();
        Market.Run();
        // for each player
        // hire new employees
        // run production
        //
        // for each Market
        // for each Good
        // run market cycle

    }
}