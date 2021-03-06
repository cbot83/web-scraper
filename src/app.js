// @ts-check
import express from "express";
import bodyParser from "body-parser";
import { buzzFeed } from "./scrapers/buzzfeed";
import { extractHostname } from "./utilities";
import { lastTry } from "./scrapers/lastTry";
import { wholekitchensink } from "./scrapers/wholekitchensink";

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

// CORS
app.use(function (req, res, next) {
  // Instead of "*" you should enable only specific origins
  res.header("Access-Control-Allow-Origin", "*");
  // Supported HTTP verbs
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  // Other custom headers
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// take a recipe URL and return the recipe info
app.post("/api/v1/recipes", async (req, res) => {
  if (!req.body.url) {
    return res.status(400).send({
      success: "false",
      message: "didn't get a url in body"
    });
  }

  const url = req.body.url;

  const hostname = extractHostname(url);

  let recipe;

  if (hostname === 'www.buzzfeed.com' || hostname === "buzzfeed.com") {

    try {
      recipe = await buzzFeed(url);
    } catch (e) {
      console.log('error', e)
    }

  } else if (hostname === 'www.wholekitchensink.com' || hostname === "wholekitchensink.com") {

    try {
      recipe = await wholekitchensink(url);
    } catch (e) {
      console.log('error', e)
    }

  } else {

    try {
      recipe = await lastTry(url);
    } catch (e) {
      console.log('error', e)
    }

  }

  return res.status(201).send({
    success: "true",
    message: `sent ${url} => here's what we found`,
    recipe
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
