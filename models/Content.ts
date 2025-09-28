import mongoose, { Document, Schema } from 'mongoose';

export interface IContent extends Document {
  title: string;
  content: string;
  type: 'announcement' | 'policy' | 'faq' | 'guide' | 'terms' | 'help';
  status: 'published' | 'draft' | 'archived';
  priority: 'low' | 'medium' | 'high';
  slug: string;
  excerpt?: string;
  tags: string[];
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
  visibility: 'public' | 'members' | 'admin';
  featured: boolean;
  viewCount: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  publishedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['announcement', 'policy', 'faq', 'guide', 'terms', 'help'],
    required: true,
    default: 'announcement'
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String]
  },
  visibility: {
    type: String,
    enum: ['public', 'members', 'admin'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
ContentSchema.index({ type: 1, status: 1 });
ContentSchema.index({ slug: 1 });
ContentSchema.index({ createdAt: -1 });
ContentSchema.index({ publishedAt: -1 });
ContentSchema.index({ status: 1, priority: -1 });

// Pre-save middleware to generate slug
ContentSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update publishedAt when status changes to published
ContentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status === 'archived' && !this.archivedAt) {
      this.archivedAt = new Date();
    }
  }
  next();
});

const Content = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);

export default Content;
