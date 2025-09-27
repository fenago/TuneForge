import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// GENERATION TASK SCHEMA
const generationTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    taskId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed', 'abandoned'],
      default: 'pending',
    },
    
    // Original generation request data
    prompt: {
      type: String,
      required: true,
    },
    title: String,
    tags: String,
    musicModel: String,
    isInstrumental: Boolean,
    selectedStyle: String,
    
    // Polling metadata
    pollAttempts: {
      type: Number,
      default: 0,
    },
    maxPollAttempts: {
      type: Number,
      default: 30, // Increased for backend polling
    },
    lastPolledAt: Date,
    nextPollAt: Date,
    
    // Completion data
    completedAt: Date,
    failedAt: Date,
    errorMessage: String,
    
    // Generated songs (will be populated once complete)
    generatedSongIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
    }],
    
    // Raw API response (for debugging)
    lastApiResponse: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for efficient querying
generationTaskSchema.index({ userId: 1, status: 1 });
generationTaskSchema.index({ taskId: 1 });
generationTaskSchema.index({ status: 1, nextPollAt: 1 }); // For background polling
generationTaskSchema.index({ createdAt: -1 });

// Virtual for time remaining
generationTaskSchema.virtual('timeElapsed').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to check if task should be abandoned
generationTaskSchema.methods.shouldAbandon = function() {
  const maxTime = 20 * 60 * 1000; // 20 minutes
  return this.timeElapsed > maxTime && this.status === 'in_progress';
};

// Method to calculate next poll time
generationTaskSchema.methods.calculateNextPoll = function() {
  const baseInterval = 15000; // 15 seconds
  const maxInterval = 60000; // 1 minute max
  
  // Exponential backoff after initial attempts
  let interval = Math.min(baseInterval * Math.pow(1.2, Math.max(0, this.pollAttempts - 5)), maxInterval);
  
  return new Date(Date.now() + interval);
};

// add plugin that converts mongoose to json
generationTaskSchema.plugin(toJSON);

export default mongoose.models.GenerationTask || mongoose.model("GenerationTask", generationTaskSchema);
