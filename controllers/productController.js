import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Helper: resolve a slug or name to all matching category IDs (including subcategories)
async function resolveCategoryIds(slugOrName) {
  if (!slugOrName || slugOrName === 'all') return null;

  // Try to find by slug first, then by name (case-insensitive)
  const cat = await Category.findOne({
    $or: [
      { slug: slugOrName.toLowerCase() },
      { name: new RegExp(`^${slugOrName}$`, 'i') },
    ],
  });

  if (!cat) return null;

  // If it's a parent category, also include all its children
  const children = await Category.find({ parent: cat._id });
  return [cat._id.toString(), ...children.map((c) => c._id.toString())];
}

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { search, category, categories, minPrice, maxPrice, sortBy, sortOrder, sizes, colors } = req.query;
    const filter = {};

    // Full-text search on name and description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter — resolve slug → category IDs, then match against category or subcategory field
    const categoryValues = [];

    if (categories && categories !== 'all') {
      const slugList = Array.isArray(categories)
        ? categories
        : String(categories).split(',').map((c) => c.trim()).filter(Boolean);
      for (const slug of slugList) {
        const ids = await resolveCategoryIds(slug);
        if (ids) categoryValues.push(...ids);
      }
    } else if (category && category !== 'all') {
      const ids = await resolveCategoryIds(category);
      if (ids) categoryValues.push(...ids);
    }

    if (categoryValues.length > 0) {
      // Match products where category OR subcategory equals any of the resolved IDs
      // Use $and to avoid overwriting any existing $or (e.g. search)
      const categoryCondition = {
        $or: [
          { category: { $in: categoryValues } },
          { subcategory: { $in: categoryValues } },
        ],
      };
      if (filter.$and) {
        filter.$and.push(categoryCondition);
      } else if (filter.$or) {
        // Search already used $or — wrap both in $and
        filter.$and = [{ $or: filter.$or }, categoryCondition];
        delete filter.$or;
      } else {
        filter.$and = [categoryCondition];
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Size filter — stored as comma-separated string e.g. "S,M,L"
    if (sizes) {
      const sizeList = Array.isArray(sizes)
        ? sizes
        : String(sizes).split(',').map((s) => s.trim()).filter(Boolean);
      if (sizeList.length > 0) {
        const sizeConditions = sizeList.map((s) => ({ sizes: { $regex: s, $options: 'i' } }));
        if (filter.$and) {
          filter.$and.push({ $or: sizeConditions });
        } else {
          filter.$and = [{ $or: sizeConditions }];
        }
      }
    }

    // Color filter — stored as comma-separated string e.g. "black,white"
    if (colors) {
      const colorList = Array.isArray(colors)
        ? colors
        : String(colors).split(',').map((c) => c.trim()).filter(Boolean);
      if (colorList.length > 0) {
        const colorConditions = colorList.map((c) => ({ colors: { $regex: c, $options: 'i' } }));
        if (filter.$and) {
          filter.$and.push({ $or: colorConditions });
        } else {
          filter.$and = [{ $or: colorConditions }];
        }
      }
    }

    // Sort
    let sort = { createdAt: -1 };
    if (sortBy && ['price', 'rating', 'createdAt'].includes(sortBy)) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: order };
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
