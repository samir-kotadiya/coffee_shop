const express = require('express');
const itemRoute = require('./item.route');
const orderRoute = require('./order.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/item',
    route: itemRoute,
  },
  {
    path: '/order',
    route: orderRoute,
  }
];

const devRoutes = [
  // routes available only in development mode
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
