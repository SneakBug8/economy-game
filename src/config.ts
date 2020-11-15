export class Config {
    public static basePath(): string {
        return __dirname ;
    }

    public static projectPath(): string {
        return __dirname + "/..";
    }

    public static dataPath(): string {
        return __dirname + "/../data";
    }

    // How much state gives to newly registered players
    public static RegistrationCash = 500;
    // Everyday fixed tax
    public static FixedTax = 100;
    public static TaxPerFactory = 100;
    public static MarketTaxPercent = 0.04;
}