import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  deliveryTime: { type: Number, required: true },
  revisions: { type: Number, required: true },
  price: { type: Number, required: true },
  features: {
    type: [String],
    required: true
  }
}, { _id: false });

const extraDeliverySchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  price: { type: Number },
  time: { type: Number }
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const requirementSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['text', 'multiple_choice'], required: true },
  choices: [String],
  required: { type: Boolean, default: true }
}, { _id: false });

const gigSchema = new mongoose.Schema({
  freelancerId: { 
    type: mongoose.Schema.Types.Mixed, 
    ref: 'Freelancer', 
    required: true 
  },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  searchTags: [{ type: String }],
  description: { type: String, required: true },
  packages: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(value: any) {
        // Allow either array format or object format with basic/standard/premium
        if (Array.isArray(value)) {
          return value.every(pkg => 
            pkg.name && pkg.description && 
            typeof pkg.deliveryTime === 'number' && 
            typeof pkg.revisions === 'number' && 
            typeof pkg.price === 'number'
          );
        } else if (typeof value === 'object' && value !== null) {
          const hasValidPackage = ['basic', 'standard', 'premium'].some(type => 
            value[type] && 
            value[type].name && 
            value[type].description && 
            typeof value[type].deliveryTime === 'number' && 
            typeof value[type].revisions === 'number' && 
            typeof value[type].price === 'number'
          );
          return hasValidPackage;
        }
        return false;
      },
      message: 'Packages must be either an array of valid packages or an object with basic/standard/premium packages'
    },
    required: true
  },
  extraFastDelivery: {
    basic: extraDeliverySchema,
    standard: extraDeliverySchema,
    premium: extraDeliverySchema
  },
  faqs: [faqSchema],
  requirements: [requirementSchema],
  images: [{ type: String }],
  video: { type: String },
  documents: [{ type: String }],
  deliveryTime: { type: Number, required: true },
  requiredSkills: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'paused', 'deleted'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

gigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Gig = mongoose.model('Gig', gigSchema); 