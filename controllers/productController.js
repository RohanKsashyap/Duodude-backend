import Product from "../models/Product.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, sortOrder } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    let sort = {};
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      if (['price', 'rating', 'createdAt'].includes(sortBy)) {
        sort[sortBy] = order;
      }
    } else {
      sort = { createdAt: -1 };
    }
    const products = await Product.find(filter).sort(sort);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error while fetching product." });
  }
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(400).json({ message: "Invalid product data." });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true, // run schema validators on update
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: "Invalid product data or server error." });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error while deleting product." });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    console.log("Attempting to fetch featured products...");
    
    // First check if we can connect to database
    const totalProducts = await Product.countDocuments();
    console.log(`Total products in database: ${totalProducts}`);
    
    const featuredProducts = await Product.find({ featured: true }).limit(8);
    console.log(`Found ${featuredProducts.length} featured products`);
    
    // If no featured products, return all products as fallback
    if (featuredProducts.length === 0) {
      console.log("No featured products found, returning first 8 products as fallback");
      const fallbackProducts = await Product.find().limit(8);
      return res.json(fallbackProducts);
    }
    
    res.json(featuredProducts);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while fetching featured products.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
