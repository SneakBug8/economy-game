import { State } from "../State";
import { PlayerService } from "services/PlayerService";
import { TelegramUser } from "../TelegramUser";
import * as TelegramBot from "node-telegram-bot-api";
import { Player } from "entity/Player";
import { MainState } from "./MainState";

export class BlankState extends State
{
    constructor()
    {
        super();

        this.functions = [
            this.OnLogin,
            this.OnRegister,
            this.OnHelp,
        ];
    }

    public async getKeyboard(): Promise<TelegramBot.KeyboardButton[][]> {
        return [
            [{ text: "🔐 /login" }, { text: "🔏 /register" }, { text: "📄 /help" }],
          ];
    }

    public async init() {
        this.OnHelp("/help");
    }

    public async OnLogin(message: string): Promise<boolean>
    {
        const loginregex = new RegExp("\/login");
        if (loginregex.test(message)) {

            this.setWaitingForValue(this.waitingLoginForLogin);

            this.Client.write(`Write username`);
            return true;
        }

        return false;
    }

    private loginUsername;

    public async waitingLoginForLogin(message: string): Promise<boolean>
    {
        const loginregex = new RegExp("^([a-zA-Z0-9]+)$");
        if (loginregex.test(message)) {
            const matches = loginregex.exec(message);
            const username = matches[1];

            this.loginUsername = username;

            this.setWaitingForValue(this.waitingLoginForPassword);

            this.Client.write(`Write password to login`);
            return true;
        }

        return false;
    }

    public async waitingLoginForPassword(message: string): Promise<boolean>
    {
        const loginregex = new RegExp("^([a-zA-Z0-9]+)$");
        if (loginregex.test(message)) {
            const matches = loginregex.exec(message);

            const username = this.loginUsername;
            const password = matches[1];

            const user = await PlayerService.Login(username, password);

            if (!user) {
                this.Client.write(`Wrong login or password`);
                return;
            }

            this.Client.playerId = user.id;

            this.Client.isAdmin = user.isAdmin !== 0;

            const teleuser = TelegramUser.Create(this.Client.chatId, this.Client.userId, this.Client.playerId);
            TelegramUser.Insert(teleuser);

            this.Client.write(`Logined as ${username}`);

            this.Client.setState(new MainState());

            return true;
        }

        return false;
    }

    public async OnRegister(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("\/register");
        if (registerregex.test(message)) {

            this.setWaitingForValue(this.waitingRegisterLogin);

            this.Client.write("Write login to register (only a-z symbols and numbers)");

            return true;
        }

        return false;
    }

    private registerLogin;

    public async waitingRegisterLogin(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([a-zA-Z0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const username = matches[1];

            this.registerLogin = username;

            this.setWaitingForValue(this.waitingRegisterPassword);

            this.Client.write(`Write password to register (only a-z symbols and numbers)`);

            return true;
        }

        this.Client.write(`You entered wrong login. Use only a-z symbols and numbers)`);

        return false;
    }

    public async waitingRegisterPassword(message: string): Promise<boolean>
    {
        const registerregex = new RegExp("^([a-zA-Z0-9]+)$");
        if (registerregex.test(message)) {
            const matches = registerregex.exec(message);

            const username = this.registerLogin;
            const password = matches[1];

            const user = await PlayerService.Register(username, password);

            if (!user) {
                this.Client.write(`Registration failed`);
                return;
            }

            this.Client.playerId = user;

            const teleuser = TelegramUser.Create(this.Client.chatId, this.Client.userId, this.Client.playerId);
            TelegramUser.Insert(teleuser);

            this.Client.write(`Registered as ${username}`);

            this.Client.setState(new MainState());

            return true;
        }

        this.Client.write(`You entered wrong password. Use only a-z symbols and numbers)`);

        return false;
    }

    public async OnHelp(message: string): Promise<boolean>
    {
        const backregex = new RegExp("\/help$");
        if (backregex.test(message)) {
            this.Client.write("Login or register");
            return true;
        }

        return false;
    }
}