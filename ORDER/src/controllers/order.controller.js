const orderModel = require("../models/order.model");
const axios = require("axios");
const { publishToQueue } = require("../broker/broker");

async function createOrder(req, res) {
  const user = req.user;
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

  try {
    // fetch user cart from cart service
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // helper to normalize product response shapes
    const extractProductFromResponse = (axiosResponse) => {
      if (!axiosResponse) return null;
      // common shapes: { data: { data: product } }, { data: product }, { product }, raw product
      if (axiosResponse.data && axiosResponse.data.data)
        return axiosResponse.data.data;
      if (axiosResponse.data && typeof axiosResponse.data === "object")
        return axiosResponse.data.product || axiosResponse.data;
      if (axiosResponse.product) return axiosResponse.product;
      return axiosResponse;
    };

    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (item) => {
        const resp = await axios.get(
          `http://localhost:3001/api/products/${item.productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return extractProductFromResponse(resp);
      })
    );

    let priceAmount = 0;

    const orderItems = cartResponse.data.cart.items.map((item, index) => {
      const product = products.find(
        (p) =>
          p._id === item.productId ||
          p._id === item.productId ||
          p.id === item.productId
      );

      if (!product) {
        throw new Error(
          `Product with id ${item.productId} not found from product service`
        );
      }

      // normalize price: product.price may be a number or an object { amount, currency }
      let unitPriceAmount = 0;
      let unitPriceCurrency = "INR";
      if (product.price == null) {
        throw new Error(`Product ${product.title || product._id} has no price`);
      }
      if (typeof product.price === "number") {
        unitPriceAmount = product.price;
        unitPriceCurrency = product.currency || "INR";
      } else if (typeof product.price === "object") {
        unitPriceAmount = product.price.amount ?? product.price.price ?? 0;
        unitPriceCurrency = product.price.currency || product.currency || "INR";
      }

      // if not in stock, do not allow order creation
      if ((product.stock ?? 0) < item.quantity) {
        throw new Error(
          `Product ${
            product.title || product._id
          } is out of stock or insufficient stock`
        );
      }

      const itemTotal = unitPriceAmount * item.quantity;
      priceAmount += itemTotal;

      return {
        product: item.productId,
        quantity: item.quantity,
        price: {
          amount: itemTotal,
          currency: unitPriceCurrency,
        },
      };
    });

    const order = await orderModel.create({
      user: user.id,
      items: orderItems,
      status: "PENDING",
      totalPrice: {
        amount: priceAmount,
        currency: "INR", // assuming all products are in USD for simplicity
      },
      shippingAddress: {
        street: req.body.shippingAddress.street,
        city: req.body.shippingAddress.city,
        state: req.body.shippingAddress.state,
        zip: req.body.shippingAddress.pincode,
        country: req.body.shippingAddress.country,
      },
    });

    await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order);

    res.status(201).json({ order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

async function getMyOrders(req, res) {
  const user = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const orders = await orderModel
      .find({ user: user.id })
      .skip(skip)
      .limit(limit)
      .exec();
    const totalOrders = await orderModel.countDocuments({ user: user.id });

    res.status(200).json({
      orders,
      meta: {
        total: totalOrders,
        page,
        limit,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

async function getOrderById(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this order" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

async function cancelOrderById(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this order" });
    }

    // only PENDING orders can be cancelled
    if (order.status !== "PENDING") {
      return res
        .status(409)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    order.status = "CANCELLED";
    await order.save();

    res.status(200).json({ order });
  } catch (err) {
    console.error(err);

    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

async function updateOrderAddress(req, res) {
  const user = req.user;
  const orderId = req.params.id;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this order" });
    }

    // only PENDING orders can have address updated
    if (order.status !== "PENDING") {
      return res
        .status(409)
        .json({ message: "Order address cannot be updated at this stage" });
    }

    order.shippingAddress = {
      street: req.body.shippingAddress.street,
      city: req.body.shippingAddress.city,
      state: req.body.shippingAddress.state,
      zip: req.body.shippingAddress.pincode,
      country: req.body.shippingAddress.country,
    };

    await order.save();

    res.status(200).json({ order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrderById,
  updateOrderAddress,
};
