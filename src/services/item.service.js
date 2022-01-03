const httpStatus = require('http-status');
const { Item } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a item
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
 const createItem = async (itemBody) => {
  if (await Item.isItemTaken(itemBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  }

  //check all item exist in db
  const itemIds = itemBody.discountItems.reduce((ids, item) => {
    ids = ids.concat(item.items);
    return ids;
  }, itemBody.freeItems || []);
  const items = await Item.find({ _id: { $in: itemIds } }).lean();
  if(items.length !== itemIds.length){
    throw new ApiError(httpStatus.BAD_REQUEST, 'some item invalid or not found or duplicated');
  }

  // check same item not added in both free and discoount array
  if(itemBody.freeItems.length && itemBody.discountItems.length){
    const disCountedItems = itemBody.discountItems.reduce((acc, item) => {
      acc = acc.concat(item.items);
      return acc;
    },[]);

    if(disCountedItems.find(id => itemBody.freeItems.includes(id))){
      throw new ApiError(httpStatus.BAD_REQUEST, 'same item can not add on both free and discount array');
    }
  }

  return Item.create(itemBody);
};

/**
 * Query for items
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Item>}
 */
const getItems = async (filter, options) => {
  const item = await Item.find().populate({ path: 'freeItems', select: 'id, name' }).populate({ path: 'discountItems.items', select: 'discountItems.max, discountItems.discount, id, name' });
  return item;
};

/**
 * Get Item by id
 * @param {ObjectId} id
 * @returns {Promise<Item>}
 */
const getItemById = async (id) => {
  const item = Item.findById(id);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'item not found');
  }
  return item;
};

module.exports = {
  createItem,
  getItems,
  getItemById,
};
