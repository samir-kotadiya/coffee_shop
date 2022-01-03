const Joi = require('joi');

const createOrder = {
  body: Joi.object().keys({
    customerName: Joi.string().required(),
    phone: Joi.string().alphanum().required().min(10).max(13),
    items: Joi.array().items(Joi.object().keys({
      id: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })),
    total: Joi.number()
  }),
};

const getOrder = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const updateStatus = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'preparing', 'prepared', 'delivered', 'completed').required(),
  }),
};

module.exports = {
  createOrder,
  getOrder,
  updateStatus
};
