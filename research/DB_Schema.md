# TuneForge Database Schema

## Overview
This document outlines the MongoDB database schema for TuneForge, including collections, document structures, and relationships.

## Collections

### 1. Users Collection (`users`)

The main user collection that stores user profiles, authentication data, and role information.

```javascript
{
  _id: ObjectId("..."),
  name: String,                    // User's display name
  email: String,                   // Unique email address (required)
  image: String,                   // Profile picture URL
  role: String,                    // User role: "ADMIN", "FREE", "PAID", "MAX"
  emailVerified: Date,             // Email verification timestamp
  createdAt: Date,                 // Account creation date
  updatedAt: Date,                 // Last profile update
  
  // Subscription & Payment Info
  subscription: {
    status: String,                // "active", "inactive", "cancelled", "trial"
    plan: String,                  // "FREE", "PAID", "MAX"
    stripeCustomerId: String,      // Stripe customer ID
    stripeSubscriptionId: String,  // Stripe subscription ID
    currentPeriodStart: Date,      // Current billing period start
    currentPeriodEnd: Date,        // Current billing period end
    cancelAtPeriodEnd: Boolean,    // Whether to cancel at period end
  },
  
  // Usage & Limits
  usage: {
    songsCreated: Number,          // Total songs created
    songsThisMonth: Number,        // Songs created this month
    lastResetDate: Date,           // Last monthly reset date
    creditsRemaining: Number,      // Credits remaining (for PAID users)
    totalCredits: Number,          // Total credits purchased
  },
  
  // Profile & Preferences
  profile: {
    bio: String,                   // User bio/description
    website: String,               // Personal website URL
    location: String,              // User location
    musicGenres: [String],         // Preferred music genres
    notifications: {
      email: Boolean,              // Email notifications enabled
      marketing: Boolean,          // Marketing emails enabled
      updates: Boolean,            // Product updates enabled
    },
    preferences: {
      theme: String,               // "light", "dark", "auto"
      language: String,            // User language preference
      timezone: String,            // User timezone
    }
  },
  
  // Authentication
  accounts: [{                     // OAuth accounts (handled by NextAuth)
    provider: String,              // "google", "email"
    providerAccountId: String,     // Provider's user ID
    type: String,                  // "oauth", "email"
    // ... other NextAuth fields
  }],
  
  // Admin specific fields (only for ADMIN role)
  adminData: {
    permissions: [String],         // Admin permissions array
    lastAdminAction: Date,         // Last admin action timestamp
    adminNotes: String,            // Internal admin notes
  }
}
```

### 2. Songs Collection (`songs`)

Stores information about songs created by users.

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),         // Reference to users._id
  title: String,                   // Song title
  description: String,             // Song description
  genre: String,                   // Music genre
  mood: String,                    // Song mood/style
  duration: Number,                // Duration in seconds
  
  // AI Generation Data
  prompt: String,                  // Original user prompt
  aiModel: String,                 // AI model used for generation
  generationParams: {
    tempo: Number,                 // BPM
    key: String,                   // Musical key
    style: String,                 // Musical style
    instruments: [String],         // Instruments used
  },
  
  // File Information
  files: {
    audioUrl: String,              // Main audio file URL
    waveformUrl: String,           // Waveform visualization URL
    stemUrls: {                    // Individual instrument stems
      drums: String,
      bass: String,
      melody: String,
      harmony: String,
    }
  },
  
  // Metadata
  status: String,                  // "generating", "completed", "failed"
  isPublic: Boolean,               // Whether song is publicly visible
  tags: [String],                  // User-defined tags
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Analytics
  playCount: Number,               // Number of times played
  downloadCount: Number,           // Number of downloads
  shareCount: Number,              // Number of shares
}
```

### 3. Sessions Collection (`sessions`)

NextAuth session management (handled automatically by NextAuth).

```javascript
{
  _id: ObjectId("..."),
  sessionToken: String,            // Unique session token
  userId: ObjectId("..."),         // Reference to users._id
  expires: Date,                   // Session expiration date
}
```

### 4. Accounts Collection (`accounts`)

NextAuth OAuth account linking (handled automatically by NextAuth).

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),         // Reference to users._id
  type: String,                    // "oauth"
  provider: String,                // "google"
  providerAccountId: String,       // Provider's user ID
  refresh_token: String,           // OAuth refresh token
  access_token: String,            // OAuth access token
  expires_at: Number,              // Token expiration timestamp
  token_type: String,              // "Bearer"
  scope: String,                   // OAuth scopes
  id_token: String,                // OpenID Connect ID token
}
```

### 5. Verification Tokens Collection (`verificationtokens`)

Email verification tokens for magic links (handled by NextAuth).

```javascript
{
  _id: ObjectId("..."),
  identifier: String,              // Email address
  token: String,                   // Verification token
  expires: Date,                   // Token expiration date
}
```

## User Roles & Permissions

### Role Hierarchy

1. **ADMIN**
   - Full system access
   - User management
   - Analytics dashboard
   - System configuration
   - Unlimited song generation

2. **MAX**
   - Premium features
   - Unlimited song generation
   - Advanced AI models
   - Priority support
   - Commercial licensing
   - Stem separation
   - Advanced customization

3. **PAID**
   - Pay-per-song model
   - Standard AI models
   - Commercial licensing
   - Basic customization
   - Email support

4. **FREE**
   - 1 free song
   - Basic AI model
   - Personal use only
   - Community support

### Dashboard Access

- **FREE users**: `/dashboard` (Basic dashboard)
- **PAID users**: `/dashboard/pro` (Pro dashboard)
- **MAX users**: `/dashboard/max` (Max dashboard)
- **ADMIN users**: `/dashboard/admin` (Admin dashboard)

## Indexes

### Users Collection
```javascript
// Unique email index
{ email: 1 }, { unique: true }

// Role-based queries
{ role: 1 }

// Subscription status queries
{ "subscription.status": 1 }

// Created date for analytics
{ createdAt: 1 }
```

### Songs Collection
```javascript
// User's songs
{ userId: 1, createdAt: -1 }

// Public songs
{ isPublic: 1, createdAt: -1 }

// Genre-based searches
{ genre: 1 }

// Status for processing queries
{ status: 1 }
```

## Default Admin User

The system will automatically assign ADMIN role to:
- Email: `learningscienceai1@gmail.com`

## Migration Notes

- Users created through OAuth will default to "FREE" role
- Existing users without roles will be assigned "FREE" role
- Subscription data will be synced with Stripe webhooks
- Usage counters reset monthly via scheduled job

## Security Considerations

- All user data is validated before database operations
- Role changes require admin privileges
- Sensitive fields (tokens, IDs) are not exposed in API responses
- Database queries use proper MongoDB operators to prevent injection
- User sessions are managed securely by NextAuth

## Backup Strategy

- Daily automated backups of all collections
- Point-in-time recovery capability
- Separate backups for user data and generated content
- Regular backup restoration testing
