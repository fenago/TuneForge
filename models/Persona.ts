import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// PERSONA SCHEMA
const personaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Persona Identity
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    
    // Suno API Data
    personaId: {
      type: String,
      required: true,
      unique: true, // Suno's persona ID
    },
    sourceClipId: {
      type: String,
      required: true, // Original song clip used to create persona
    },
    sourceSongTitle: {
      type: String, // Title of the source song for reference
    },
    
    // Metadata
    status: {
      type: String,
      enum: ['creating', 'ready', 'failed'],
      default: 'creating',
    },
    errorMessage: String,
    
    // Usage Statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,
    
    // Persona Characteristics (for display)
    voiceType: {
      type: String,
      enum: ['male', 'female', 'mixed', 'unknown'],
      default: 'unknown',
    },
    genres: [String], // Extracted from description
    characteristics: [String], // Tags like 'deep voice', 'rhythmic', 'soulful'
    
    // Advanced Settings
    isPublic: {
      type: Boolean,
      default: false, // Future feature: public persona sharing
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for efficient querying
personaSchema.index({ userId: 1, createdAt: -1 });
personaSchema.index({ personaId: 1 });
personaSchema.index({ status: 1 });
personaSchema.index({ userId: 1, isFavorite: -1 });

// Virtual for display name with usage info
personaSchema.virtual('displayName').get(function() {
  const usageText = this.usageCount > 0 ? ` (${this.usageCount} songs)` : ' (New)';
  return `${this.name}${usageText}`;
});

// Method to increment usage
personaSchema.methods.recordUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Method to extract characteristics from description
personaSchema.methods.extractCharacteristics = function() {
  const desc = this.description.toLowerCase();
  const characteristics = [];
  
  // Voice type detection
  if (desc.includes('male') && !desc.includes('female')) {
    this.voiceType = 'male';
  } else if (desc.includes('female') && !desc.includes('male')) {
    this.voiceType = 'female';
  } else if (desc.includes('mixed') || (desc.includes('male') && desc.includes('female'))) {
    this.voiceType = 'mixed';
  }
  
  // Characteristic extraction
  const charMap = {
    'deep': ['deep', 'bass', 'low'],
    'high': ['high', 'tenor', 'soprano'],
    'smooth': ['smooth', 'silky', 'velvet'],
    'rough': ['rough', 'raspy', 'gritty'],
    'rhythmic': ['rhythmic', 'percussive', 'beat'],
    'melodic': ['melodic', 'singing', 'tune'],
    'powerful': ['powerful', 'strong', 'bold'],
    'soft': ['soft', 'gentle', 'whisper'],
    'energetic': ['energetic', 'upbeat', 'lively'],
    'calm': ['calm', 'peaceful', 'serene']
  };
  
  for (const [char, keywords] of Object.entries(charMap)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      characteristics.push(char);
    }
  }
  
  this.characteristics = characteristics;
};

// add plugin that converts mongoose to json
personaSchema.plugin(toJSON);

export default mongoose.models.Persona || mongoose.model("Persona", personaSchema);
