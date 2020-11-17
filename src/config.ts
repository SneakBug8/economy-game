import { Good } from "entity/Good";
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
    public static MarketTaxPercent = 0.04;

    public static LoginBonus = 10;

    public static WorkersRecruitmentSpeed = 0.25;

    public static MaxFactoriesPerPlayer = 10;

    public static NewFactoryCosts: Array<{ goodId: number, Amount: number }> =
    [
        {
            goodId: 1,
            Amount: 300,
        },
    ];

    // Dictionary <RGOType.id, Dictionary <Good.id, amount>>
    public static RGOCostsDictionary: Map<number, Array<{ goodId: number, Amount: number }> > = new Map(
        [
            [1, [
                {
                    goodId: 1,
                    Amount: 300,
                },
            ]],
        ]);
}
