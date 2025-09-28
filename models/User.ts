import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// Define user roles enum
export const UserRoles = {
  ADMIN: 'ADMIN',
  FREE: 'FREE', 
  PAID: 'PAID',
  MAX: 'MAX'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    
    // Role-based access control
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.FREE,
    },
    
    // Subscription & Payment Info
    subscription: {
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'trial'],
        default: 'inactive',
      },
      plan: {
        type: String,
        enum: ['FREE', 'PAID', 'MAX'],
        default: 'FREE',
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
    },
    
    // Usage & Limits
    usage: {
      songsCreated: {
        type: Number,
        default: 0,
      },
      songsThisMonth: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
      creditsRemaining: {
        type: Number,
        default: 0,
      },
      totalCredits: {
        type: Number,
        default: 0,
      },
    },
    
    // Pending generation tasks (for recovery when user leaves page)
    pendingTasks: [{
      taskId: String,
      prompt: String,
      title: String,
      tags: String,
      model: String,
      personaId: String, // Optional persona ID used
      createdAt: Date
    }],
    
    // Profile & Preferences
    profile: {
      bio: String,
      website: String,
      location: String,
      musicGenres: [String],
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
        updates: {
          type: Boolean,
          default: true,
        },
      },
      preferences: {
        theme: {
          type: String,
          enum: ['light', 'dark', 'auto'],
          default: 'light',
        },
        language: {
          type: String,
          default: 'en',
        },
        timezone: String,
      },
    },
    
    // Legacy Stripe fields (kept for backward compatibility)
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
    
    // Admin specific fields (only populated for ADMIN role)
    adminData: {
      permissions: [String],
      lastAdminAction: Date,
      adminNotes: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ createdAt: 1 });

// Virtual for dashboard URL based on role
userSchema.virtual('dashboardUrl').get(function() {
  switch (this.role) {
    case UserRoles.ADMIN:
      return '/dashboard/admin';
    case UserRoles.MAX:
      return '/dashboard/max';
    case UserRoles.PAID:
      return '/dashboard/pro';
    case UserRoles.FREE:
    default:
      return '/dashboard';
  }
});

// Method to check if user has specific role or higher
userSchema.methods.hasRole = function(requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRoles.FREE]: 0,
    [UserRoles.PAID]: 1,
    [UserRoles.MAX]: 2,
    [UserRoles.ADMIN]: 3,
  };
  
  const userRoleLevel = roleHierarchy[this.role as UserRole] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
};

// Method to check if user can create songs
userSchema.methods.canCreateSongs = function(): boolean {
  if (this.role === UserRoles.ADMIN || this.role === UserRoles.MAX) {
    return true; // Unlimited
  }
  
  if (this.role === UserRoles.PAID) {
    return this.usage.creditsRemaining > 0;
  }
  
  if (this.role === UserRoles.FREE) {
    return this.usage.songsCreated === 0; // Only 1 free song
  }
  
  return false;
};

// Method to get remaining song limit
userSchema.methods.getRemainingLimit = function(): number | 'unlimited' {
  if (this.role === UserRoles.ADMIN || this.role === UserRoles.MAX) {
    return 'unlimited';
  }
  
  if (this.role === UserRoles.PAID) {
    return this.usage.creditsRemaining;
  }
  
  if (this.role === UserRoles.FREE) {
    return Math.max(0, 1 - this.usage.songsCreated);
  }
  
  return 0;
};

// Pre-save middleware to set admin role for specific email
userSchema.pre('save', function(next) {
  // Auto-assign ADMIN role to specific email
  if (this.email === 'learningscieanceai1@gmail.com' && this.role !== UserRoles.ADMIN) {
    this.role = UserRoles.ADMIN;
    this.adminData = {
      permissions: ['all'],
      lastAdminAction: new Date(),
      adminNotes: 'Auto-assigned admin role',
    };
  }
  
  // Reset monthly usage if needed
  const now = new Date();
  const lastReset = this.usage.lastResetDate || new Date(0);
  const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                          (now.getMonth() - lastReset.getMonth());
  
  if (monthsSinceReset >= 1) {
    this.usage.songsThisMonth = 0;
    this.usage.lastResetDate = now;
  }
  
  next();
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
