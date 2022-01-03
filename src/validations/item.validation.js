const Joi = require('joi');

const createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    price: Joi.number().required().min(1),
    tax: Joi.number().optional().default(0),
    freeItems: Joi.array(),
    discountItems: Joi.array().items(Joi.object().keys({
      items: Joi.array(), 
      discount: Joi.number(), 
      max: Joi.number()
    })).optional()
  }),
};

const getItem = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};


module.exports = {
  createItem,
  getItem
};
