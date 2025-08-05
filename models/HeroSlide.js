import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  secondaryButtonText: {
    type: String,
    default: 'Learn More'
  },
  secondaryButtonLink: {
    type: String,
    default: '/about'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  backgroundColor: {
    type: String,
    default: '#000000'
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  overlayOpacity: {
    type: Number,
    default: 0.4,
    min: 0,
    max: 1
  }
}, {
  timestamps: true
});

// Index for ordering slides
heroSlideSchema.index({ order: 1, isActive: 1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;
