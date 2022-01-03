const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      validate(value) {
        if (value <= 0) {
          throw new Error('Price should be greater than zero');
        }
      },
    },
    tax: { // in %
      type: Number,
      default: 0,
    },
    freeItems: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
    discountItems: [{ 
      items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}], 
      discount: { 
        type: Number,
        require: true,
        validate(value) {
          if (value <= 0) {
            throw new Error('discount should be greater than zero');
          }
        }
      },
      max: {
        type: Number,
        default: 1,
        validate(value) {
          if (value >= 3) {
            throw new Error('maximum 2 item should discounted per item');
          }
        }
      }
    }]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The item's email
 * @param {ObjectId} [excludeItemId] - The id of the item to be excluded
 * @returns {Promise<boolean>}
 */
itemSchema.statics.isItemTaken = async function (name, excludeitemId) {
  const item = await this.findOne({ name, _id: { $ne: excludeitemId } });
  return !!item;
};

itemSchema.pre('save', async function (next) {
  const item = this;
  // TO DO pre save opt.
  next();
});

/**
 * @typedef Item
 */
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
