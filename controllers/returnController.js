import Return from "../models/Return.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Create a new return request
export const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, reason, images } = req.body;
    
    // Find the order and verify ownership
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Check if order is delivered
    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Can only return delivered orders" });
    }
    
    // Check if return period is valid for each item
    const currentDate = new Date();
    for (const item of items) {
      const orderItem = order.items.find(oi => oi.product._id.toString() === item.product);
      if (!orderItem) {
        return res.status(400).json({ message: "Item not found in order" });
      }
      
      const product = orderItem.product;
      if (!product.returnAvailable) {
        return res.status(400).json({ message: `${product.name} is not eligible for return` });
      }
      
      const orderDate = new Date(order.createdAt);
      const returnExpiry = new Date(orderDate.getTime() + (product.returnPeriodDays * 24 * 60 * 60 * 1000));
      
      if (currentDate > returnExpiry) {
        return res.status(400).json({ 
          message: `Return period expired for ${product.name}. Returns must be initiated within ${product.returnPeriodDays} days.` 
        });
      }
    }
    
    // Calculate refund amount
    let refundAmount = 0;
    for (const item of items) {
      const orderItem = order.items.find(oi => oi.product._id.toString() === item.product);
      refundAmount += orderItem.product.price * item.quantity;
    }
    
    // Create return request
    const returnRequest = new Return({
      order: orderId,
      user: req.user._id,
      items,
      reason,
      refundAmount,
      images: images || [],
      returnPeriodExpiry: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days to ship back
    });
    
    await returnRequest.save();
    await returnRequest.populate([
      { path: 'order', select: 'total createdAt' },
      { path: 'items.product', select: 'name price images' }
    ]);
    
    res.status(201).json(returnRequest);
  } catch (error) {
    console.error("Error creating return request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's return requests
export const getUserReturns = async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id })
      .populate('order', 'total createdAt')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json(returns);
  } catch (error) {
    console.error("Error fetching user returns:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all return requests (admin only)
export const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('user', 'name email')
      .populate('order', 'total createdAt')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json(returns);
  } catch (error) {
    console.error("Error fetching returns:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update return status (admin only)
export const updateReturnStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    returnRequest.status = status;
    if (adminNotes) returnRequest.adminNotes = adminNotes;
    
    await returnRequest.save();
    await returnRequest.populate([
      { path: 'user', select: 'name email' },
      { path: 'order', select: 'total createdAt' },
      { path: 'items.product', select: 'name price images' }
    ]);
    
    res.json(returnRequest);
  } catch (error) {
    console.error("Error updating return status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get return by ID
export const getReturnById = async (req, res) => {
  try {
    const returnRequest = await Return.findById(req.params.id)
      .populate('user', 'name email')
      .populate('order', 'total createdAt')
      .populate('items.product', 'name price images');
    
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }
    
    // Check if user owns this return or is admin
    if (returnRequest.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(returnRequest);
  } catch (error) {
    console.error("Error fetching return:", error);
    res.status(500).json({ message: "Server error" });
  }
};
