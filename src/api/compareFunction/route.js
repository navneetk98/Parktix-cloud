const express = require("express");
const {
    fun
   } = require('./index');
module.exports = () => {
  const routes = express.Router();
  routes.post('/test', (req, res) => {
    return res.status(200).send("Working....");
  });
  routes.post('/verify', (req, res) => {
    return fun(req, res);
});
  return routes;
};