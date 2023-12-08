const assert = require("assert");
const Definer = require("../lib/mistake");
const OrderModel = require("../schema/order.model");
const OrderItemModel = require("../schema/order_item.model");
const bcrypt = require("bcryptjs");
const { shapeIntoMongooseObjectId } = require("../lib/config");

class Order {
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
  }

  async createOrderData(member, data) {
    try {
      let order_total_amount = 0,
        delivery_cost = 0;
      const mb_id = shapeIntoMongooseObjectId(member._id);

      data.map(({ quantity, price }) => {
        order_total_amount += quantity * price;
      });

      if (order_total_amount < 100) {
        delivery_cost = 2;
        order_total_amount += delivery_cost;
      }
      const order_id = await this.saveOrderData(
        order_total_amount,
        delivery_cost,
        mb_id
      );

      console.log("order_id:::", order_id);

      //order item creation

      await this.recordOrderItemsDta(order_id, data);

      return order_id;
    } catch (err) {
      throw err;
    }
  }

  async saveOrderData(order_total_amount, delivery_cost, mb_id) {
    try {
      const new_order = new this.orderModel({
        order_total_amount: order_total_amount,
        order_delivery_cost: delivery_cost,
        mb_id: mb_id,
      });

      const result = await new_order.save();
      assert.ok(result, Definer.order_err1);

      return result._id;
    } catch (err) {
      console.log(err);
      throw new Error(Definer.order_err1);
    }
  }

  async recordOrderItemsDta(order_id, data) {
    try {
      const pro_list = data.map(async (item) => {
        return await this.saveOrderItemData(item, order_id);
      });

      const results = await Promise.all(pro_list);
      console.log("result:::", results);
      return true;
    } catch (err) {
      throw err;
    }
  }

  async saveOrderItemData({ _id, quantity, price }, order_id) {
    try {
      order_id = shapeIntoMongooseObjectId(order_id);
      _id = shapeIntoMongooseObjectId(_id);

      const order_item = new this.orderItemModel({
        item_quantity: quantity,
        item_price: price,
        order_id: order_id,
        product_id: _id,
      });

      const result = await order_item.save();
      assert.ok(result, Definer.order_err2);
      return "inserted";
    } catch (err) {
      console.log(err);
      throw new Error(Definer.order_err2);
    }
  }

  async getMyOrdersData(member, query) {
    try {
      const mb_id = shapeIntoMongooseObjectId(member._id),
        order_status = query.status.toUpperCase(),
        matches = { mb_id: mb_id, order_status: order_status };

      const result = await this.orderModel
        .aggregate([
          { $match: matches },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "orderitems",
              localField: "_id",
              foreignField: "order_id",
              as: "order_items",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "order_items.product_id",
              foreignField: "_id",
              as: "product_data",
            },
          },
        ])
        .exec();
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Order;
