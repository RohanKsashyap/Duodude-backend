import Category from "../models/Category.js";

// Get all categories (flat list, populated with parent info)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent", "name slug").sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error while fetching categories." });
  }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("parent", "name slug");
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching category." });
  }
};

// Create a category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, parent, description, active } = req.body;

    // Auto-build slug if missing
    const finalSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Ensure slug is unique
    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ message: `Slug "${finalSlug}" already exists. Choose a different name or slug.` });
    }

    const category = new Category({
      name: name.trim(),
      slug: finalSlug,
      parent: parent || null,
      description: description?.trim() || "",
      active: active !== undefined ? active : true,
    });

    await category.save();
    const populated = await category.populate("parent", "name slug");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(400).json({ message: error.message || "Invalid category data." });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { name, slug, parent, description, active } = req.body;

    // If slug is changing, check uniqueness
    if (slug) {
      const existing = await Category.findOne({ slug: slug.trim(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: `Slug "${slug}" already in use.` });
      }
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase() }),
        parent: parent || null,
        ...(description !== undefined && { description: description.trim() }),
        ...(active !== undefined && { active }),
      },
      { new: true, runValidators: true }
    ).populate("parent", "name slug");

    if (!updated) return res.status(404).json({ message: "Category not found." });
    res.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(400).json({ message: error.message || "Invalid category data." });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    // Prevent deleting parent categories that still have children
    const children = await Category.countDocuments({ parent: req.params.id });
    if (children > 0) {
      return res.status(400).json({
        message: "Cannot delete a category that has subcategories. Delete the subcategories first.",
      });
    }

    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found." });
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error while deleting category." });
  }
};
