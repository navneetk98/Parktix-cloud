const express = require("express");

module.exports = () => {
  const routes = express.Router();
  routes.get('/test', (req, res) => {
    return res.status(200).send("Working....");
  });
  return routes;
};