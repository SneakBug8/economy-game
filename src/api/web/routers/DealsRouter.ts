import bodyParser = require("body-parser");
import { Deal } from "entity/Deal";
import { Player } from "entity/Player";
import { Turn } from "entity/Turn";
import * as express from "express";
import { body } from "express-validator";
import { DealService } from "services/DealService";
import { IMyRequest, WebClientUtil } from "../WebClientUtil";

export class DealsRouter
{
    public static GetRouter()
    {
        const router = express.Router();

        router.use(bodyParser.urlencoded({ extended: true }));

        router.get("/", [WebClientUtil.RedirectUnlogined], this.onHome);
        router.post("/new", [
            WebClientUtil.RedirectUnlogined,
            body("username", "Empty login").trim().isLength({ min: 1 }).escape(),
        ], this.onNewDeal);
        router.get("/:id([0-9]+)", [WebClientUtil.RedirectUnlogined,
        WebClientUtil.LoadGoods], this.onDeal);
        router.get("/:id([0-9]+)/remove/:goodId([0-9]+)", [WebClientUtil.RedirectUnlogined], this.onRemoveGoods);
        router.get("/:id([0-9]+)/confirm", [WebClientUtil.RedirectUnlogined], this.onConfirm);
        router.get("/:id([0-9]+)/revert", [WebClientUtil.RedirectUnlogined], this.onRevert);
        router.get("/:id([0-9]+)/commit", [WebClientUtil.RedirectUnlogined], this.onCommit);
        router.post("/:id([0-9]+)", [WebClientUtil.RedirectUnlogined], this.onAddGoods);

        return router;
    }

    public static async onHome(req: IMyRequest, res: express.Response)
    {
        const r1 = await Player.GetById(req.client.playerId);

        if (!r1) {
            WebClientUtil.error(req, res, r1.message);
            return;
        }
        const currplayer = r1.data;

        const deals = await Deal.GetWithPlayer(currplayer.CurrentMarketId, currplayer.id);

        for (const deal of deals) {
            (deal as any).anotherPlayerName = await DealService.GetAnotherPlayerName(deal, req.client.playerId);
        }
        WebClientUtil.render(req, res, "deals/dealslist", {
            data: deals,
        });
    }

    public static async onNewDeal(req: IMyRequest, res: express.Response)
    {
        const username = req.body.username;

        const r1 = await Player.GetById(req.client.playerId);

        if (!r1.result) {
            WebClientUtil.error(req, res, r1.message);
            return;
        }
        const currplayer = r1.data;

        const player = await Player.GetWithLogin(username);

        if (!player) {
            WebClientUtil.error(req, res, "No such player");
            return;
        }

        const answer = await Deal.Create(currplayer.CurrentMarketId, currplayer.id, player.id);
        if (typeof answer !== "number") {
            WebClientUtil.error(req, res, answer as string);
            return;
        }

        res.redirect(req.baseUrl + "/" + answer);
    }

    public static async onDeal(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);

        const deal = await Deal.GetById(dealId);

        if (!deal) {
            res.redirect(req.baseUrl + "/");
            return;
        }

        if (!DealService.EnsureOwnDeal(deal, req.client.playerId)) {
            WebClientUtil.error(req, res, "That's not your deal");
            return;
        }

        (deal as any).anotherPlayerName = await DealService.GetAnotherPlayerName(deal, req.client.playerId);

        const owngoods = await DealService.LoadGoods(deal, req.client.playerId);
        const hisgoods = await DealService.LoadGoods(deal,
            await DealService.GetAnotherPlayerId(deal, req.client.playerId));

        WebClientUtil.render(req, res, "deals/deal", {
            data: deal,
            confirmOwn: (req.client.playerId === deal.fromId) ? deal.confirmFrom : deal.confirmTo,
            confirmHis: (req.client.playerId !== deal.fromId) ? deal.confirmFrom : deal.confirmTo,
            owngoods,
            hisgoods,
        });
    }

    public static async onConfirm(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);
        const answer = await DealService.Confirm(dealId, req.client.playerId);

        if (answer !== true) {
            WebClientUtil.error(req, res, answer as string);
            return;
        }

        res.redirect(req.client.getUrl());
    }

    public static async onCommit(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);
        const answer = await DealService.Commit(dealId);

        if (answer !== true) {
            WebClientUtil.error(req, res, answer as string);
            return;
        }

        res.redirect(req.client.getUrl());
    }

    public static async onRevert(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);
        const answer = await DealService.Revert(dealId);

        if (answer !== true) {
            WebClientUtil.error(req, res, answer as string);
            return;
        }
        res.redirect(req.client.getUrl());
    }

    public static async onAddGoods(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);

        const goodId = Number.parseInt(req.body.goodId, 10);
        const amount = Number.parseInt(req.body.amount, 10);

        const answer = await DealService.AddGood(dealId, req.client.playerId, goodId, amount);

        if (answer !== true) {
            WebClientUtil.error(req, res, answer as string);
            return;
        }

        res.redirect(req.client.getUrl());
    }

    public static async onRemoveGoods(req: IMyRequest, res: express.Response)
    {
        const dealId = Number.parseInt(req.params.id, 10);
        const goodId = Number.parseInt(req.params.goodId, 10);

        const answer = await DealService.RemoveGood(dealId, req.client.playerId, goodId);

        if (answer !== true) {
            WebClientUtil.error(req, res, answer as string);
            return;
        }

        res.redirect(req.client.getUrl());
    }
}
