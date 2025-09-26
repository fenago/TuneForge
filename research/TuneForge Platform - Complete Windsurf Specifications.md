# TuneForge Platform - Complete Windsurf Specifications

## Project Overview

**Platform Name**: TuneForge  
**Tagline**: "Audio Experience"  
**Purpose**: AI-powered music creation platform using Suno API  
**Tech Stack**: Next.js, TypeScript, TailwindCSS, DaisyUI, MongoDB, Stripe, NextAuth  
**Base Repository**: fenago21 (already cloned and configured)

---

## Brand Identity & Design System

### Color Palette
- **Primary Gradient**: `linear-gradient(to right, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB)`
- **Primary Colors**:
  - Blue Violet: `#8A2BE2`
  - Indigo: `#4B0082` 
  - Dark Slate Blue: `#483D8B`
  - Slate Blue: `#6A5ACD`
  - Medium Slate Blue: `#7B68EE`
  - Medium Purple: `#9370DB`

### Typography
- **Primary Font**: Inter (sans-serif) - for UI elements and body text
- **Secondary Font**: DM Serif Display (serif) - for major headlines
- **Font Sizes**: H1 (3rem/48px), H2 (2.25rem/36px), H3 (1.875rem/30px), Body (1rem/16px)

### Logo
- Use the typographic logo with stylized 'o' resembling a vinyl record
- Include "AUDIO EXPERIENCE" tagline
- File location: `/public/tuneforge-logo.png`

---

## Landing Page Specifications

### 1. Navigation Bar
**Requirements**: Fixed header with transparent background that becomes opaque on scroll

**Components**:
- Logo (left): TuneForge logo linking to homepage
- Navigation Links (center): "Features", "Pricing", "Blog", "Contact"
- Authentication (right): "Login" button and primary "Sign Up" CTA

**Styling**:
- Background: Transparent initially, `#1a202c` on scroll
- Typography: Inter, regular weight for links
- CTA Button: Primary gradient background (`#8A2BE2` to `#4B0082`)
- Hover Effects: Subtle underline for navigation links

### 2. Hero Section
**Requirements**: Attention-grabbing section with emotional appeal and clear CTA

**Layout**: Two-column layout (text left, image right) on desktop, stacked on mobile

**Content**:
- **Headline (H1)**: "Unleash Your Inner Composer. Create Studio-Quality Music in Seconds."
- **Subheadline**: "TuneForge is your AI-powered music creation partner. No experience needed. Just bring your ideas, and we'll handle the rest. Create your first song for free!"
- **Primary CTA**: "Start Creating for Free" (gradient button)
- **Secondary CTA**: "See TuneForge in Action" (outline button)

**Visual Elements**:
- Background: Dark neutral with animated sound wave graphics using brand colors
- Hero Image: Musicians/creators using devices to make music
- Testimonial Avatars: Small avatar row below CTAs

**Styling**:
- Headline: DM Serif Display, bold, gradient text effect
- Buttons: Large, prominent, with hover animations
- Responsive: Stack vertically on mobile

### 3. Problem Section
**Requirements**: Articulate pain points of traditional music creation

**Layout**: Three-column card layout with icons

**Content**:
- **Section Headline**: "Tired of the Old Way of Making Music?"
- **Column 1**: "Expensive Software & Royalties" - Traditional music production costs
- **Column 2**: "The Endless Learning Curve" - Time to master complex software  
- **Column 3**: "Stuck in a Creative Rut?" - Difficulty finding inspiration

**Styling**:
- Background: Neutral dark (`#2a2e37`)
- Cards: White background with subtle shadows
- Icons: Heroicons set (dollar sign, clock, blocked lightbulb)
- Typography: White text on dark background

### 4. Solution Section  
**Requirements**: Position TuneForge as the solution to stated problems

**Layout**: Three-column grid with gradient cards

**Content**:
- **Section Headline**: "TuneForge is Your Creative Breakthrough"
- **Column 1**: "Create More, Spend Less" - Affordable royalty-free generation
- **Column 2**: "From Idea to Anthem in Seconds" - Instant creation capability
- **Column 3**: "Your Infinite Music Engine" - Endless creative possibilities

**Styling**:
- Background: Light gradient (`from-purple-50 to-blue-50`)
- Cards: Gradient backgrounds with rounded corners
- Icons: Custom icons in circular gradient containers
- Typography: Dark text on light backgrounds

### 5. Features Section (Accordion)
**Requirements**: Interactive accordion showcasing key capabilities

**Layout**: Two-column (accordion left, media right)

**Content**:
- **Section Headline**: "Everything You Need to Sound Amazing"
- **Feature 1**: "AI-Powered Vocals & Instrumentals" - Generate realistic vocals or instrumentals
- **Feature 2**: "Customize and Remix" - Extend, swap sounds, replace sections
- **Feature 3**: "Commercial-Ready & Royalty-Free" - Full commercial licensing
- **Feature 4**: "Simple for Beginners, Powerful for Pros" - Adaptive workflow

**Interactions**:
- Clicking feature title expands description
- Media changes based on selected feature
- Smooth animations for expand/collapse

**Styling**:
- Active feature: Primary color highlight
- Media: Square aspect ratio, rounded corners
- Icons: Heroicons with primary color when active

### 6. Product Showcase Section
**Requirements**: Visual demonstration of the platform

**Layout**: Centered video/demo area with surrounding feature callouts

**Content**:
- **Section Headline**: "See TuneForge in Action"
- **Demo Video**: Placeholder for actual product demo
- **Feature Callouts**: "Studio Quality", "30 Seconds", "Commercial Rights", "No Watermarks"
- **Process Steps**: 3-step process below video

**Styling**:
- Background: Gradient (`from-purple-50 to-blue-50`)
- Video Container: Dark background with play button overlay
- Callouts: White cards with colored indicators
- Steps: Numbered circles with gradient backgrounds

### 7. Pricing Section
**Requirements**: Clear pricing tiers encouraging free trial

**Layout**: Two-column pricing cards

**Content**:
- **Section Headline**: "Simple, Transparent Pricing"
- **Free Trial Card**: $0, 1 Free Song, Access to core features, Commercial rights
- **Creator+ Card**: $2/song, Pay-as-you-go, All AI models, Priority support (Featured)

**Styling**:
- Featured card: Primary gradient border and highlight
- Cards: Clean white background with feature lists
- CTAs: Matching button styles for each tier
- Checkmarks: Green checkmark icons for features

### 8. Testimonials Section
**Requirements**: Social proof from different user types

**Layout**: Carousel or grid of testimonial cards

**Content**:
- **Section Headline**: "Loved by Creators Everywhere"
- **Testimonial 1**: Aisha Chen, Content Creator - workflow improvement
- **Testimonial 2**: Elena Rodriguez, Indie Game Developer - bottleneck solution
- **Testimonial 3**: John Williams, Music Producer - quality and integration

**Styling**:
- Cards: Clean white background with user photos
- Photos: Circular, professional-looking
- Text: Quoted testimonials with attribution
- Navigation: Carousel controls if needed

### 9. Final CTA Section
**Requirements**: Last conversion opportunity

**Content**:
- **Headline**: "Ready to Create Your Masterpiece?"
- **CTA Button**: "Start Creating for Free"

**Styling**:
- High-contrast background
- Large, prominent CTA button
- Consistent with hero section styling

### 10. Footer
**Requirements**: Standard footer with organized links

**Layout**: Multi-column layout with logo and links

**Content**:
- **Logo**: TuneForge logo
- **Product Links**: Features, Pricing, Sign Up, Login
- **Company Links**: About Us, Blog, Contact  
- **Legal Links**: Terms of Service, Privacy Policy
- **Social Media**: Icons linking to platforms
- **Copyright**: "© 2025 TuneForge. All rights reserved."

**Styling**:
- Dark background
- Organized column layout
- Functional links
- Social media icons

---

## User Dashboard Specifications

### Layout Structure
**Requirements**: Two-column layout with fixed sidebar navigation

**Sidebar Components**:
- TuneForge logo at top
- Navigation: "Create Music", "My Library", "Buy Credits", "Settings"
- User profile at bottom with avatar, name, logout

**Main Content Area**: Dynamic based on selected navigation

### Create Music Page (Default View)
**Requirements**: Three-step music creation process

**Step 1: Describe Your Song**
- Large textarea for song description
- Placeholder: "A dreamy pop song about summer love with a female vocalist..."
- Genre/Mood tags: Multi-select dropdown
- Instrumental toggle: Switch for vocals vs instrumental

**Step 2: Choose Your Style (Optional)**
- Grid of style cards: "80s Synthwave", "Modern Hip-Hop", "Cinematic Score"
- "Surprise Me" button for random style selection

**Step 3: Generate**
- Prominent "Generate" button (disabled until prompt entered)
- Credit counter showing remaining credits and cost
- Loading state with encouraging message during generation

### My Library Page
**Requirements**: Display and manage created songs

**Components**:
- Search bar for finding songs by title
- Filter options for genre and date
- Song list/grid showing:
  - Song title
  - Genre/mood tags
  - Creation date
  - Play button
  - Download button
  - More options menu (Delete, View Details, Remix)

### Buy Credits Page
**Requirements**: Secure credit purchasing interface

**Components**:
- Credit pack options as cards: "100 Credits for $20", "500 Credits for $90"
- Stripe payment integration
- Current credit balance display
- Purchase history

### Settings Page
**Requirements**: Account management interface

**Components**:
- Profile settings: Name and profile picture update
- Password change form
- Notification preferences: Email opt-in/out checkboxes
- Account deletion option

---

## Admin Panel Specifications

### Access & Security
**Requirements**: Separate secure login for admin access

### Dashboard (Default View)
**Requirements**: Business metrics overview

**Key Metrics Cards**:
- Total Revenue
- Monthly Recurring Revenue (MRR)
- New Users (last 30 days)
- Total Songs Generated

**Charts & Graphs**:
- Line chart: Revenue over time
- Bar chart: New user sign-ups per month
- Pie chart: Most popular genres

### User Management
**Requirements**: Comprehensive user administration

**User Table Columns**:
- User ID
- Name
- Email
- Sign-up Date
- Total Spent
- Number of Songs Generated

**Actions per User**:
- View Details
- Edit
- Suspend
- Delete

**Features**:
- Search and sort functionality
- Bulk actions
- User activity logs

### Song Management
**Requirements**: Content moderation and oversight

**Song Table Columns**:
- Song ID
- Title
- User
- Creation Date
- Genre
- Play count

**Actions per Song**:
- Listen
- View Details
- Delete
- Flag for review

### Content Management
**Requirements**: Landing page content updates without code change

**Manageable Content**:
- Testimonials: Add, edit, delete customer testimonials
- Blog posts: Content management system
- Pricing: Adjust prices and credit pack options
- Feature descriptions: Update landing page copy

### Settings
**Requirements**: Platform configuration management

**Configuration Options**:
- Suno API key management
- Pricing adjustments
- Feature flags
- Email templates
- System maintenance mode

---

## Technical Implementation Requirements

### Database Models (MongoDB)
**User Model**:
- Authentication data (NextAuth integration)
- Credit balance
- Subscription status
- Created songs array
- Profile information

**Song Model**:
- User reference
- Suno API response data
- Metadata (title, genre, duration)
- File URLs
- Creation timestamp

**Transaction Model**:
- User reference
- Amount
- Type (credit purchase, song generation)
- Stripe payment data
- Timestamp

### API Endpoints
**Suno Integration**:
- `/api/suno/generate` - Create new song
- `/api/suno/status` - Check generation status
- `/api/suno/download` - Get song files

**User Management**:
- `/api/user/credits` - Get/update credit balance
- `/api/user/songs` - Get user's song library
- `/api/user/profile` - Update profile

**Payment Processing**:
- `/api/stripe/create-checkout` - Credit purchase
- `/api/stripe/webhook` - Handle payment events
- `/api/stripe/portal` - Customer portal access

### Authentication & Authorization
**NextAuth Configuration**:
- Google OAuth provider
- Magic link authentication
- Session management
- Protected routes for dashboard and admin

**Role-Based Access**:
- User role: Access to dashboard features
- Admin role: Access to admin panel
- Route protection middleware

### Responsive Design Requirements
**Breakpoints** (Tailwind CSS):
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

**Mobile Adaptations**:
- Hamburger menu for navigation
- Stacked layouts
- Larger touch targets
- Simplified interfaces

### Performance & SEO
**Optimization Requirements**:
- Image optimization with Next.js Image component
- Lazy loading for non-critical content
- SEO meta tags for all pages
- Sitemap generation
- Analytics integration (DataFast)

### Deployment Configuration
**Environment Variables**:
- Suno API credentials
- Stripe keys
- MongoDB connection string
- NextAuth configuration
- Email service credentials

**Production Considerations**:
- CDN for static assets
- Database indexing for performance
- Error monitoring
- Backup strategies
- SSL certificate configuration

---

## File Structure & Organization

### Component Organization
```
/components
  /landing
    - Hero.tsx
    - Problem.tsx
    - Solution.tsx
    - Features.tsx
    - ProductShowcase.tsx
    - Pricing.tsx
    - Testimonials.tsx
    - CTA.tsx
  /dashboard
    - Sidebar.tsx
    - CreateMusic.tsx
    - Library.tsx
    - Credits.tsx
    - Settings.tsx
  /admin
    - AdminDashboard.tsx
    - UserManagement.tsx
    - SongManagement.tsx
    - ContentManagement.tsx
  /shared
    - Header.tsx
    - Footer.tsx
    - Loading.tsx
    - Modal.tsx
```

### Page Structure
```
/app
  - page.tsx (Landing page)
  - layout.tsx (Root layout)
  /dashboard
    - page.tsx (Create music)
    - layout.tsx (Dashboard layout)
    /library
      - page.tsx
    /credits
      - page.tsx
    /settings
      - page.tsx
  /admin
    - page.tsx (Admin dashboard)
    - layout.tsx (Admin layout)
    /users
      - page.tsx
    /songs
      - page.tsx
    /content
      - page.tsx
  /api
    /suno
      - generate/route.ts
      - status/route.ts
    /user
      - credits/route.ts
      - songs/route.ts
    /stripe
      - checkout/route.ts
      - webhook/route.ts
```

This comprehensive specification provides all the details needed to implement the TuneForge platform in Windsurf, including visual design, functionality, technical requirements, and file organization.
