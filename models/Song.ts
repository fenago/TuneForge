import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";
import { UnifiedSongMetadata, APIProvider, SongStatus } from '@/types/unified-song';

// UNIFIED SONG SCHEMA - Supports both SunoAPI.com and SunoAPI.org
const songSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // API TRACKING - CRITICAL for dual-provider support
    apiProvider: {
      type: String,
      enum: ['sunoapi_com', 'sunoapi_org'],
      required: true,
      default: 'sunoapi_com'
    },
    apiTaskId: {
      type: String,
      required: true,
      index: true
    },
    apiClipId: {
      type: String,
      index: true
    },
    apiResponseRaw: {
      type: mongoose.Schema.Types.Mixed, // Store original API response
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000, // Increased to accommodate full song lyrics
    },
    genre: {
      type: String,
      required: true,
      lowercase: true, // Automatically convert to lowercase
      enum: [
        'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 
        'country', 'r&b', 'reggae', 'folk', 'blues', 'metal', 
        'punk', 'indie', 'ambient', 'house', 'techno', 'dubstep'
      ],
    },
    mood: {
      type: String,
      lowercase: true, // Automatically convert to lowercase
      enum: [
        'happy', 'sad', 'energetic', 'calm', 'romantic', 'aggressive',
        'mysterious', 'uplifting', 'melancholic', 'epic', 'dreamy', 'dark'
      ],
    },
    duration: {
      type: Number, // Duration in seconds
      min: 10,
      max: 600, // 10 minutes max
    },
    
    // AI Generation Data
    prompt: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    aiModel: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'max', 'chirp-v3-5', 'chirp-v4', 'chirp-v4-5', 'chirp-v4-5-plus'],
      default: 'chirp-v3-5',
    },
    generationParams: {
      tempo: {
        type: Number,
        min: 60,
        max: 200,
      },
      key: {
        type: String,
        enum: [
          'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
          'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
        ],
      },
      style: String,
      instruments: [String],
    },
    
    // File Information
    files: {
      audioUrl: String, // Main audio file URL
      videoUrl: String, // Video file URL from Suno
      waveformUrl: String, // Waveform visualization URL
      stemUrls: {
        drums: String,
        bass: String,
        melody: String,
        harmony: String,
        vocals: String,
      },
      thumbnailUrl: String, // Album art/thumbnail
      // File metadata
      fileSizes: {
        audio: Number, // Audio file size in bytes
        video: Number, // Video file size in bytes
        thumbnail: Number, // Thumbnail file size in bytes
      },
      fileFormats: {
        audio: String, // e.g., 'mp3', 'wav'
        video: String, // e.g., 'mp4', 'webm'
        thumbnail: String, // e.g., 'jpeg', 'png'
      },
      quality: {
        audioBitrate: Number, // Audio bitrate in kbps
        videoResolution: String, // Video resolution e.g., '1080p'
        thumbnailDimensions: {
          width: Number,
          height: Number,
        },
      },
    },
    
    // Metadata
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    
    // Analytics
    playCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    
    // Generation metadata (unified)
    generationTime: Number, // Time taken to generate in seconds
    generationStartTime: Date, // When generation started
    generationEndTime: Date, // When generation completed
    errorMessage: String, // Error message if generation failed
    taskId: String, // DEPRECATED - use apiTaskId
    clipId: String, // DEPRECATED - use apiClipId
    lyrics: String, // Full structured lyrics (separate from description)
    originalCreatedAt: Date, // Original API creation timestamp
    isInstrumental: {
      type: Boolean,
      default: false
    },
    
    // VARIATION SUPPORT
    parentSongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    isVariation: {
      type: Boolean,
      default: false
    },
    variationType: {
      type: String,
      enum: ['extend', 'cover', 'remix', 'stems']
    },
    
    // QUALITY METRICS
    generationCost: {
      type: Number,
      default: 0
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    
    // METADATA TRACKING
    metadataCoverageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastMetadataUpdate: {
      type: Date,
      default: Date.now
    },
    
    // Generation Analytics
    generationAnalytics: {
      pollingAttempts: Number, // Number of polling attempts needed
      totalWaitTime: Number, // Total generation wait time in ms
      apiResponseCode: Number, // Final API response code
      apiResponseTime: Number, // API response time in ms
    },
    
    // Music Analysis & Discovery
    musicAnalysis: {
      energy: Number, // Musical energy/intensity rating (0-1)
      valence: Number, // Happiness/sadness score (0-1)
      danceability: Number, // How danceable the track is (0-1)
      acousticness: Number, // Acoustic vs electric (0-1)
      instrumentalness: Number, // Likelihood of being instrumental (0-1)
      liveness: Number, // Presence of audience/live recording (0-1)
      speechiness: Number, // Presence of spoken words (0-1)
      
      // Confidence scores
      genreConfidence: Number, // How strongly it matches detected genre (0-1)
      moodConfidence: Number, // How strongly it matches detected mood (0-1)
      
      // Advanced metrics
      loudness: Number, // Overall loudness in dB
      modality: Number, // Major (1) or minor (0)
      timeSignature: Number, // Time signature (e.g., 4 for 4/4)
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
songSchema.index({ userId: 1, createdAt: -1 });
songSchema.index({ isPublic: 1, createdAt: -1 });
songSchema.index({ genre: 1 });
songSchema.index({ status: 1 });
songSchema.index({ mood: 1 });

// Virtual for formatted duration
songSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to increment play count
songSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Method to increment download count
songSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment share count
songSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  return this.save();
};

// Method to check if user can access this song
songSchema.methods.canUserAccess = function(userId: string, userRole: string) {
  // User can access their own songs
  if (this.userId.toString() === userId) {
    return true;
  }
  
  // Admins can access all songs
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Public songs can be accessed by anyone
  if (this.isPublic) {
    return true;
  }
  
  return false;
};

// Pre-save middleware
songSchema.pre('save', function(next) {
  // Auto-generate title if not provided
  if (!this.title && this.prompt) {
    this.title = this.prompt.substring(0, 50) + (this.prompt.length > 50 ? '...' : '');
  }
  
  // Auto-truncate description if it exceeds 2000 characters
  if (this.description && this.description.length > 2000) {
    this.description = this.description.substring(0, 1997) + '...';
    console.log('📝 Description truncated to 2000 characters (including "...")');
  }
  
  next();
});

// add plugin that converts mongoose to json
songSchema.plugin(toJSON);

export default mongoose.models.Song || mongoose.model("Song", songSchema);
