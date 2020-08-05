const express = require("express");
const {
  in_fun,
  in_simple,
  out_fun
   } = require('./index');
module.exports = () => {
  const routes = express.Router();
  routes.post('/test', (req, res) => {
    return res.status(200).send("Working....");
  });
  routes.post('/verify', (req, res) => {
    return in_fun(req, res);
});
routes.post('/simple_verify', (req, res) => {
  return in_simple(req, res);
});
routes.post('/out_verify', (req, res) => {
  return out_fun(req, res);
});
  return routes;
};