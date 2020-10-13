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

    public static RegistrationCash = 500;
}