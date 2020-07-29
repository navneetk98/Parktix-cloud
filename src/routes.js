const express = require("express");
const compareRoute = require("./api/compareFunction/route");

module.exports = (app) => {
app.use("/compare/", compareRoute());
};