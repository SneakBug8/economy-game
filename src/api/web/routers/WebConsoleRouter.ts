import { handler } from "api/console/main";
import bodyParser = require("body-parser");
import { Deal } from "entity/Deal";
import { Player } from "entity/Player";
import { Turn } from "entity/Turn";
import * as express from "express";
import { body } from "express-validator";
import { DealService } from "services/DealService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class WebConsoleRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use((req, res, next) => WebClientUtil.LoadPlayerData(req, res, next));

        router.use(bodyParser.urlencoded({ extended: true }));

        router.get("/changeTurn", [WebClientUtil.RedirectUnlogined], this.onTurn);

        router.get("/", [WebClientUtil.RedirectUnlogined], this.onGet);
        router.post("/", [WebClientUtil.RedirectUnlogined,
            body("msg", "Wrong msg").isAlphanumeric().notEmpty()], this.onPost);

        return router;
    }

    public static async onGet(req: IMyRequest, res: express.Response)
    {
        const r1 = await Player.GetById(req.client.playerId);
        if (!r1.result) {
            return WebClientUtil.error(req, res, r1.message);
        }
        const currplayer = r1.data;

        if (!currplayer) {
            WebClientUtil.error(req, res, "You don't exist");
            return;
        }

        if (currplayer.id > 4){
            return;
        }

        WebClientUtil.render(req, res, "console/home");
    }

    public static async onPost(req: IMyRequest, res: express.Response)
    {
        const msg = req.body.msg;
        await handler(msg);

        WebClientUtil.render(req, res, "console/home");
    }

    public static async onTurn(req: IMyRequest, res: express.Response)
    {
        await handler("turn");

        WebClientUtil.renderLast(req, res);
    }
}
