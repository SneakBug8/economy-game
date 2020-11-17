import * as express from "express";
import { Logger } from "utility/Logger";
import { WebClient } from "./WebClient";
import { body, validationResult } from "express-validator";
import * as bodyParser from "body-parser";
import { PlayerService } from "services/PlayerService";

export class WebAPI
{
    public static clients = new Array<WebClient>();

    public static Init(app: express.Express)
    {
        app.use((req, res, next) => this.LoadPlayerData(req, res, next));




        app.get("/", this.onHome);

        app.use(bodyParser.urlencoded({ extended: true }));

        app.get("/register", this.onRegister);
        app.post("/register", [
            body("login", "Empty login").trim().isLength({ min: 1 }).escape(),
            body("password", "Empty password").trim().isLength({ min: 1 }).escape(),
            body("passwordconfirm", "Empty passwordconfirmation").trim().isLength({ min: 1 }).escape(),
            body("passwordconfirm", "Pasword confirm must be same as password").custom((value, {req}) => req.body && req.body.password === value),
        ], this.registerAction);

        app.get("/login", this.onLogin);
        app.post("/login", [
            body("login", "Empty login").trim().isLength({ min: 1 }).escape(),
            body("password", "Empty password").trim().isLength({ min: 1 }).escape(),
        ], this.loginAction);

        app.use(this.RedirectUnlogined);
    }

    public static LoadPlayerData(req: IMyRequest, res: express.Response, next: () => void)
    {
        for (const client of this.clients) {
            if (req.cookies.id && req.cookies.id === client.clientId) {
                req.client = client;
                next();
                return;
            }
        }

        let id = req.cookies.id || Number.parseInt(req.cookies.id, 10) || 0;
        if (!id) {
            id = Math.round(Math.random() * 100000);
        }

        Logger.info("New client id " + id);

        res.cookie("id", id);

        const client = new WebClient(id);
        this.clients.push(client);

        req.client = client;
        next();
    }

    public static RedirectUnlogined(req: IMyRequest, res: express.Response, next: () => void)
    {
        if (!req.client || !req.client.playerId || !req.client.actorId) {
            res.redirect("/");
            return;
        }
    }

    public static onHome(req: IMyRequest, res: express.Response)
    {
        if (!req.client || !req.client.playerId || !req.client.actorId) {
            res.render("unlogined");
            return;
        }

        res.render("home");
    }

    public static onRegister(req: IMyRequest, res: express.Response)
    {
        res.render("register");
    }

    public static async registerAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            res.render("register", {
                error: errors.array()[0].msg,
            });
            return;
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Register(login, password);
        await req.client.attach(user);

        res.redirect("/");
    }

    public static onLogin(req: IMyRequest, res: express.Response)
    {
        res.render("login");
    }

    public static async loginAction(req: IMyRequest, res: express.Response)
    {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            // Error messages can be returned in an array using `errors.array()`.
            res.render("login", {
                error: errors.array()[0].msg,
            });
            return;
        }

        const login = req.body.login;
        const password = req.body.password;

        const user = await PlayerService.Login(login, password);
        await req.client.attach(user.id);

        res.redirect("/");
    }
}

interface IMyRequest extends express.Request
{
    client?: WebClient;
}