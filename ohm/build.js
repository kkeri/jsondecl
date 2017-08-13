"use strict"

const fs = require("fs");
const path = require("path");
const ohm = require("ohm-js");

const parserPath = path.join(__dirname, 'parser.ohm');
const recipePath = path.join(__dirname, "recipe.js");

console.log('Compiling grammar...')
let parser = ohm.grammar(fs.readFileSync(parserPath));
console.log("Building parser recipe...");
let recipe = parser.toRecipe();
fs.writeFileSync(recipePath, recipe, { encoding: "utf-8" });
console.log("Done.");
