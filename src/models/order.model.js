const { string } = require('joi');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    items: [{
      id: {type: mongoose.Schema.Types.ObjectId, ref: 'Item'},
      isFree: { type: Boolean},
      quantity: {type: Number, default: 1},
      price: {type: Number, default: 0},
      discount:{type: String},
      discountAmount:{type: Number},
      priceAfterDiscount:{type: Number},
      total: {type: Number},
      tax: {type: Number}
    }],
    tax: {
      type: Number,
      default: 0,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'prepared', 'delivered', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

orderSchema.pre('save', async function (next) {
  const order = this;
  // TO DO pre save opt.
  next();
});

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order