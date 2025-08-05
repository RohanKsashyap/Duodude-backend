import HeroSlide from '../models/HeroSlide.js';

// Get all active hero slides (for frontend)
export const getActiveSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all slides (for admin)
export const getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single slide
export const getSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }
    res.json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new slide (admin only)
export const createSlide = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      secondaryButtonText,
      secondaryButtonLink,
      backgroundColor,
      textColor,
      overlayOpacity,
      order
    } = req.body;

    const slide = new HeroSlide({
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      secondaryButtonText,
      secondaryButtonLink,
      backgroundColor,
      textColor,
      overlayOpacity,
      order
    });

    const savedSlide = await slide.save();
    res.status(201).json(savedSlide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update slide (admin only)
export const updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedSlide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete slide (admin only)
export const deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle slide active status (admin only)
export const toggleSlideStatus = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    slide.isActive = !slide.isActive;
    const updatedSlide = await slide.save();
    res.json(updatedSlide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder slides (admin only)
export const reorderSlides = async (req, res) => {
  try {
    const { slideOrders } = req.body; // Array of { id, order }
    
    const updatePromises = slideOrders.map(({ id, order }) =>
      HeroSlide.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);
    
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: 1 });
    
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

