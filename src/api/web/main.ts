import * as express from "express";
import { BuyOffer } from "entity/BuyOffer";
import { SellOffer } from "entity/SellOffer";
import { Factory } from "entity/Factory";
import { Player } from "entity/Player";
import { PlayerLog } from "entity/PlayerLog";
const app = express();
const port = 3000;

app.get("/", (req, res) =>
{
    res.send("Hello World!");
});

app.listen(port, () =>
{
    console.log(`Server listening at http://localhost:${port}`);
});

app.use((req, res, next) => {
    console.log(req.method + " to " + req.url);
    next();
});

app.get("/buyoffer", async (req, res) =>
{
    res.json(await BuyOffer.All());
});

app.get("/buyoffer/:id", async (req, res) =>
{
    try {
        res.json(await BuyOffer.GetById(Number.parseInt(req.params.id, 10)));
    }
    finally {

    }
});

app.get("/selloffer", async (req, res) =>
{
    res.json(await SellOffer.All());
});

app.get("/selloffer/:id", async (req, res) =>
{
    try {
        res.json(await SellOffer.GetById(Number.parseInt(req.params.id, 10)));
    }
    finally {

    }
});

app.get("/factory", async (req, res) =>
{
    res.json(await Factory.All());
});

app.get("/factory/:id", async (req, res) =>
{
    try {
        res.json(await Factory.GetById(Number.parseInt(req.params.id, 10)));
    }
    finally {

    }
});

app.get("/player", async (req, res) =>
{
    res.json(await Player.All());
});

app.get("/player/:id", async (req, res) =>
{
    try {
        res.json(await Player.GetById(Number.parseInt(req.params.id, 10)));
    }
    finally {

    }
});

app.get("/playerlog/:id", async (req, res) =>
{
    try {
        res.json(await PlayerLog.GetWithPlayer(Number.parseInt(req.params.id, 10)));
    }
    finally {

    }
});