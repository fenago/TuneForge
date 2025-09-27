# TuneForge — AI-Powered Music Creation Platform

![TuneForge Logo](./public/tuneforge_logo.png)

**Tagline**: "Audio Experience"

TuneForge is an AI-powered music creation platform that empowers creators to generate studio-quality music in seconds. Whether you're a content creator, indie game developer, or music enthusiast, TuneForge makes professional music creation accessible to everyone—no experience needed.

Transform your creative ideas into full songs instantly using cutting-edge AI technology powered by the Suno API. Create commercially licensed, royalty-free music for any project.

<sub>**Unleash Your Inner Composer — Create Studio-Quality Music in Seconds**</sub>

## 🚀 Key Features

### 🎵 AI-Powered Music Generation
- **Instant Creation**: Generate studio-quality music in seconds
- **Vocal & Instrumental**: Create songs with realistic vocals or purely instrumental tracks
- **Genre Flexibility**: Support for all music genres and moods
- **Commercial Rights**: Royalty-free music ready for any project

### 🎨 User Experience
- **Beginner-Friendly**: No musical experience required
- **Professional Tools**: Advanced features for seasoned producers
- **Customization**: Extend, remix, and modify your creations
- **Simple Workflow**: Three-step creation process

### 💼 Business Features
- **Flexible Pricing**: Pay-per-song model with credit packs
- **Free Trial**: Create your first song for free
- **User Dashboard**: Comprehensive library management
- **Admin Panel**: Complete business analytics and user management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, DaisyUI
- **Backend**: Next.js API Routes, MongoDB Atlas
- **Authentication**: NextAuth.js (Google OAuth, Magic Links)
- **Payments**: Stripe Integration
- **AI Integration**: Suno API for music generation
- **Email**: Resend.com
- **Analytics**: DataFast
- **Deployment**: Vercel/Netlify ready

## 🎯 Getting Started

Follow these steps to get TuneForge up and running:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fenago/fenago21.git
   cd fenago21
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   - Rename `.env.sample` to `.env`
   - Add your API keys and credentials:
     ```env
     # Suno API
     SUNO_API_KEY=your_suno_api_key
     
     # Database
     MONGODB_URI=your_mongodb_connection_string
     
     # Authentication
     NEXTAUTH_SECRET=your_nextauth_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     
     # Payments
     STRIPE_SECRET_KEY=your_stripe_secret_key
     STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
     
     # Email
     RESEND_API_KEY=your_resend_api_key
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` to see TuneForge in action!

## 📚 Platform Architecture

### 🏠 Landing Page
- **Hero Section**: Compelling value proposition with clear CTAs
- **Problem/Solution**: Articulates pain points and positions TuneForge as the solution
- **Features Showcase**: Interactive accordion highlighting key capabilities
- **Pricing**: Simple, transparent pricing with free trial
- **Testimonials**: Social proof from diverse user types
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🎛️ User Dashboard
- **Create Music**: Three-step music generation process
  - Step 1: Describe your song with genre/mood tags
  - Step 2: Choose style (optional)
  - Step 3: Generate with credit tracking
- **My Library**: Song management with search, filter, and download
- **Buy Credits**: Secure Stripe-powered credit purchasing
- **Settings**: Profile management and preferences

### 👑 Admin Panel
- **Analytics Dashboard**: Revenue, user metrics, and growth charts
- **User Management**: Comprehensive user administration
- **Song Management**: Content oversight and moderation
- **Content Management**: Landing page content updates
- **Settings**: API keys, pricing, and platform configuration

## 🎨 Design System

### Color Palette
- **Primary Gradient**: `linear-gradient(to right, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB)`
- **Primary Colors**: Blue Violet (#8A2BE2), Indigo (#4B0082), Slate Blue variants
- **Neutrals**: Dark Blue (#1a202c), Medium Gray (#718096), Light Gray (#f7fafc)

### Typography
- **Primary Font**: Inter (sans-serif) - UI elements and body text
- **Secondary Font**: DM Serif Display (serif) - major headlines
- **Responsive**: Mobile-first with standard Tailwind breakpoints

## 📖 Documentation

### [Research Documents](./research)
Comprehensive platform specifications:
- [Complete Platform Specifications](./research/TuneForge%20Platform%20-%20Complete%20Windsurf%20Specifications.md)
- [Brand Identity & Design System](./research/TuneForge%20Brand%20Identity%20&%20Design%20System.md)
- [Landing Page Specification](./research/TuneForge%20Landing%20Page%20Specification.md)
- [User Dashboard & Admin Panel Specifications](./research/TuneForge%20User%20Dashboard%20&%20Admin%20Panel%20Specifications.md)

### [DevDocs](./DevDocs)
Implementation guides for core functionality:
- [Setting Up Email With Resend](./DevDocs/1_Setting_Up_Email_With_Resend.md)
- [Setting Up MongoDB Atlas](./DevDocs/2_Setting_Up_MongoDB_Atlas.md)
- [Setting Up Google Authentication](./DevDocs/3_Setting_Up_Google_Authentication.md)
- [Setting Up Magic Links Authentication](./DevDocs/4_Setting_Up_Magic_Links_Authentication.md)
- [Setting Up Stripe Payments](./DevDocs/5_Setting_Up_Stripe_Payments.md)
- [Setting Up SEO Features](./DevDocs/6_Setting_Up_SEO_Features.md)
- [Setting Up Analytics With DataFast](./DevDocs/7_Setting_Up_Analytics_With_DataFast.md)
- [UI Components Guide](./DevDocs/0_UI_Components_Guide.md)

### [DevPlanDocs](./DevPlanDocs)
Architecture and development planning:
- [Architecture Overview](./DevPlanDocs/1-Architecture-Overview.md)
- [Components Overview](./DevPlanDocs/2-Components-Overview.md)
- [Development Plan](./DevPlanDocs/3-Development-Plan.md)
- [API Endpoints](./DevPlanDocs/4-API-Endpoints.md)
- [Database Models](./DevPlanDocs/5-Database-Models.md)
- [Authentication System](./DevPlanDocs/6-Authentication-System.md)
- [Payment Integration](./DevPlanDocs/7-Payment-Integration.md)

## 🔧 API Endpoints

### Suno Integration
- `POST /api/suno/generate` - Create new song
- `GET /api/suno/status` - Check generation status
- `GET /api/suno/download` - Get song files

### User Management
- `GET /api/user/credits` - Get credit balance
- `POST /api/user/credits` - Update credits
- `GET /api/user/songs` - Get user's library
- `PUT /api/user/profile` - Update profile

### Payment Processing
- `POST /api/stripe/create-checkout` - Credit purchase
- `POST /api/stripe/webhook` - Handle payment events
- `GET /api/stripe/portal` - Customer portal access

## 🗄️ Database Models

### User Model
```javascript
{
  id: ObjectId,
  email: String,
  name: String,
  credits: Number,
  songs: [ObjectId],
  subscription: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Song Model
```javascript
{
  id: ObjectId,
  userId: ObjectId,
  title: String,
  genre: String,
  mood: String,
  prompt: String,
  sunoData: Object,
  fileUrls: Object,
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  id: ObjectId,
  userId: ObjectId,
  type: String, // 'credit_purchase', 'song_generation'
  amount: Number,
  stripeData: Object,
  createdAt: Date
}
```

## 🚀 Deployment

### Environment Variables Required
```env
# Core
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Database
MONGODB_URI=mongodb+srv://...

# Suno API
SUNO_API_KEY=your_suno_key

# Authentication
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Analytics
DATAFAST_API_KEY=your_datafast_key
```

### Production Checklist
- [ ] Set up MongoDB Atlas cluster
- [ ] Configure Suno API access
- [ ] Set up Stripe webhooks
- [ ] Configure domain and SSL
- [ ] Set up error monitoring
- [ ] Configure backup strategies

## 🎵 Usage Examples

### Creating Your First Song
1. **Sign up** for a free account
2. **Describe your song**: "A upbeat pop song about summer adventures with female vocals"
3. **Choose genre tags**: Pop, Upbeat, Summer
4. **Generate**: Click the generate button and wait ~30 seconds
5. **Download**: Your royalty-free song is ready!

### For Content Creators
- Generate background music for YouTube videos
- Create intro/outro jingles for podcasts
- Produce royalty-free music for social media content

### For Game Developers
- Generate ambient soundtracks for different game levels
- Create sound effects and musical stingers
- Produce menu and loading screen music

### For Businesses
- Create hold music for phone systems
- Generate background music for presentations
- Produce custom jingles for marketing campaigns

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions, support, or feature requests:
- **Email**: support@tuneforge.com
- **Documentation**: Check our comprehensive docs above
- **Issues**: Create an issue on GitHub

---

**Built with ❤️ for creators everywhere. Start your musical journey with TuneForge today!**
