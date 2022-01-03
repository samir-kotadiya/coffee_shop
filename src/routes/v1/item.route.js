const express = require('express');
const validate = require('../../middlewares/validate');
const itemValidation = require('../../validations/item.validation');
const itemController = require('../../controllers/item.controller');

const router = express.Router();

router
  .route('/')
  .post(validate(itemValidation.createItem), itemController.createItem)
  .get(itemController.getItems);

router
  .route('/:id')
  .get(validate(itemValidation.getItem), itemController.getItem);
  
module.exports = router;