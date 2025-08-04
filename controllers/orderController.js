import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Admin: get all orders, populate user and product details
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")            // user info
      .populate("items.product", "name price image images");  // product info with images
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get orders for current logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price image images");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID (user must own order or be admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price image images");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check ownership or admin role
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    console.log('Order creation request:', { items, total, shippingAddress, paymentMethod, userId: req.user._id });

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip || !shippingAddress.country) {
      return res.status(400).json({ message: "All shipping address fields are required" });
    }
    
    if (!total || typeof total !== 'number') {
      return res.status(400).json({ message: "Valid total amount is required" });
    }

    // Check and update stock for each product
    for (const item of items) {
      if (!item.product || !item.quantity || typeof item.quantity !== 'number') {
        return res.status(400).json({ message: "Invalid item data" });
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user._id,
      items,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: "Pending"
    });

    const savedOrder = await order.save();
    console.log('Order created successfully:', savedOrder._id);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Detailed error creating order:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${validationErrors.join(', ')}` });
    }
    
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// Delete order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

// Cancel order (user can cancel if not delivered)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership or admin role
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if order can be cancelled
    if (order.status === "delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered orders" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Restore stock for cancelled items
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;
    const totalUsers = await User.countDocuments();
    // Sales by month (last 12 months)
    const salesByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ totalOrders, totalSales, totalUsers, salesByMonth });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
