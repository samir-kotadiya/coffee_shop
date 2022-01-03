const express = require('express');
const validate = require('../../middlewares/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/order.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(orderValidation.createOrder), orderController.createOrder)
  .get(orderController.getOrders);

router
  .route('/:id')
  .get(validate(orderValidation.getOrder), orderController.getOrder)
  .patch(validate(orderValidation.updateStatus), orderController.updateOrderStatus);

module.exports = router;