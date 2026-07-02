import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
  try {
    console.log("Cart controller - Getting cart for user:", req.user?._id);
    
    if (!req.user || !req.user._id) {
      console.error("Cart controller - No user found in request");
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    console.log("Cart controller - Cart found:", cart ? "Yes" : "No");
    
    res.json(cart || { user: req.user._id, items: [] });
  } catch (err) {
    console.error("Cart controller - Error fetching cart:", err);
    res.status(500).json({
      message: 'Server error fetching cart',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, size });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId, size } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) =>
        !(item.product.toString() === productId && item.size === size)
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error removing item' });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity, size } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Match by productId and optionally size (size may be undefined for items added without size)
    const item = cart.items.find((i) => {
      const sameProduct = i.product.toString() === productId;
      // If size is provided in the request, match it; otherwise match any size
      return size !== undefined ? sameProduct && i.size === size : sameProduct;
    });

    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();

    const populated = await cart.populate('items.product');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart quantity' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart' });
  }
};
