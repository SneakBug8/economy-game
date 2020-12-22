import { Good } from "entity/Good";
import { RecipeEntry } from "entity/Recipe";
import { GoodsList } from "services/GoodsList";
import { RecipesService } from "services/RecipesService";

export class Config
{
    public static basePath(): string
    {
        return __dirname;
    }

    public static projectPath(): string
    {
        return __dirname + "/..";
    }

    public static dataPath(): string
    {
        return __dirname + "/../data";
    }

    // How much state gives to newly registered players
    public static RegistrationCash = 500;
    // Everyday fixed tax
    public static FixedTax = 100;
    public static TaxPerFactory = 100;
    public static TaxPerRGO = 100;
    public static MarketTaxPercent = 0.04;

    public static LoginBonus = 10;

    public static WorkersRecruitmentSpeed = 0.25;

    public static MaxFactoriesPerPlayer = 10;

    public static EverydayInflation = 0.01;

    public static NewFactoryCosts: RecipeEntry[] =
    [
        new RecipeEntry(2, 300),
    ];

    public static MarketingCost = 100;

    public static GoldGoodId = 1;

    // Dictionary <RGOType.id, Dictionary <Good.id, amount>>
    public static RGOCostsDictionary: Map<number, RecipeEntry[] > = new Map(
        [
            [1, [
                new RecipeEntry(2, 300),
            ]],
        ]);

    public static DefaultRGOCosts: RecipeEntry[] = [
        new RecipeEntry(2, 300),
    ];

    public static TradeShipGoodId = GoodsList.Fertilizer;
    public static HorseGoodId = GoodsList.Fertilizer;
}
