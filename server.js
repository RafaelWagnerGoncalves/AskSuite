require("dotenv").config();
const puppeteer = require("puppeteer");
const Joi = require("joi");
const express = require("express");
const router = require("./routes/router.js");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.post("/search", async(req, res) => {
    const schema = Joi.object({
        checkin: Joi.string().min(10).max(10).required(),
        checkout: Joi.string().min(10).max(10).required(),
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
        res.status(400).send(validation.error);
        return;
    }

    const find = {
        checkin: req.body.checkin,
        checkout: req.body.checkout,
    };

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(
        `https://pratagy.letsbook.com.br/D/Reserva?checkin=${find.checkin}&checkout=${find.checkout}&cidade=&hotel=12&adultos=2&criancas=&destino=Pratagy+Beach+Resort+All+Inclusive&promocode=&tarifa=&mesCalendario=6%2F14%2F2022`
    );
    await page.waitForNavigation();
    await page.waitForSelector(".tdQuarto");

    data = await page.evaluate(() => {
        info = Array.from(document.querySelectorAll(".row-quarto"));
        quartos = info.map((quarto) => ({
            Name: quarto.querySelector("span.quartoNome").innerText,
            Description: quarto.querySelector(".quartoDescricao").innerText,
            Price: quarto.querySelector("span.valorFinal.valorFinalDiscounted")
                .innerText,
            Url: quarto
                .querySelector(".tdQuarto li:first-child .room--image")
                .getAttribute("data-src"),
        }));
        return quartos;
    });
    return res.send(data);
});

app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});