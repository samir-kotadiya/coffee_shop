const httpStatus = require('http-status');
const { Order, Item, Notification } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  const itemIds = orderBody.items.reduce((ids, item) => {
    ids.push(item.id);
    return ids;
  }, []);
  const items = await Item.find({ _id: { $in: itemIds } }).lean();
  if(items.length !== itemIds.length){
    throw new ApiError(httpStatus.BAD_REQUEST, 'some item invalid or not found');
  }

  //logic for calculate total, tax and discount
  const { total, subTotal, tax } = orderBody.items.reduce((resp, item) => {

    const itm = items.find(o => o._id.toString() === item.id.toString());
    if (!itm) {
      console.log('item not exist in db', item.id);
      return resp;
    }
    item = Object.assign(item, itm);
    console.log('inner item', item)

    // check for free items
    const isFree = items.find(o => o.freeItems.map(id => id.toString()).includes(item.id.toString()));
    if(isFree){
      item.isFree = true;
      delete item.tax;
      return resp;
    }

    const isDiscount = items.reduce((acc, i) => {
      return i.discountItems.find(o => o.items.map(id => id.toString()).includes(item.id.toString()))
    }, null);
    
    let discountAmountWithoutTax = 0;
    if(isDiscount){
      discountAmountWithoutTax = Number(item.price * isDiscount.discount / 100);
      item.tempPrice = item.price; // store actual price in temp
      item.priceAfterDiscount = Number((item.price - discountAmountWithoutTax).toFixed(2));
      item.price = item.priceAfterDiscount; //remove discouted amount from price so it wont add tax on discount amount
      discountAmountWithoutTax *= item.quantity;
      item.discountAmount = discountAmountWithoutTax;
      item.discount = `${isDiscount.discount}% on item price`;
    }

    let totl = Number(item.price * item.quantity);
    let sbTotal = totl;
    let tx = 0;
    if (item.tax) {
      tx = Number((item.tax / 100) * item.price);
      tx *= item.quantity;
      totl += tx;
    }

    item.total = totl;
    item.subTotal = sbTotal;
    item.tax = tx;
    item.price = item.tempPrice || item.price;

    resp.total += totl;
    resp.subTotal += sbTotal;
    resp.tax += tx;
    return resp;
  }, { total: 0, subTotal: 0, tax: 0 });

  orderBody.total = total.toFixed(2);
  orderBody.tax = tax.toFixed(2);
  orderBody.subTotal = subTotal.toFixed(2);

  return Order.create(orderBody);
};

/**
 * Query for orders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Order>}
 */
const getOrders = async (filter, options) => {
  return Order.find().populate({ path: 'items.id', select: 'id, name' });
};

/**
 * Get Item by id
 * @param {ObjectId} id
 * @returns {Promise<Item>}
 */
const getOrderById = async (id) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'order not found');
  }
  return order;
};

const updateStatusById = async (id, status) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'order not found');
  }
  
  if(order.status === status){
    return order;
  }

  // create notification
  if(status === 'prepared'){
    Notification.create({
      customerName: order.customerName,
      orderId: order.id,
      text: 'Order is prepared and ready'
    });
  }
  
  order.status = status;
  
  await order.save();
  return order;
};

const notifyCustomerIfOrderIsReadyorAfterMin = async () => {
  // prepare date
  const date = new Date();
  date.setMinutes(date.getMinutes() - 5);
  console.log(date, new Date())
  const orders = await Order.find( {status:{$ne:'prepared'}, createdAt: {$lte:date} });
  if (orders.length <= 0) {
    console.log('order not found');
  }

  console.log(orders)
  for(const order of orders){
    //update order status
    order.status = 'prepared';
    order.save();
    //create notification
    Notification.create({
      customerName: order.customerName,
      orderId: order.id,
      text: 'Order is prepared and ready'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateStatusById,
  notifyCustomerIfOrderIsReadyorAfterMin
};
