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

## Documentation

FeNAgO comes with comprehensive documentation to help you get started quickly:

### [DevDocs](./DevDocs)

Implementation guides for setting up core functionality:

- [Setting Up Email With Resend](./DevDocs/1_Setting_Up_Email_With_Resend.md)
- [Setting Up MongoDB Atlas](./DevDocs/2_Setting_Up_MongoDB_Atlas.md)
- [Setting Up Google Authentication](./DevDocs/3_Setting_Up_Google_Authentication.md)
- [Setting Up Magic Links Authentication](./DevDocs/4_Setting_Up_Magic_Links_Authentication.md)
- [Setting Up Stripe Payments](./DevDocs/5_Setting_Up_Stripe_Payments.md)
- [Setting Up SEO Features](./DevDocs/6_Setting_Up_SEO_Features.md)
- [Setting Up Analytics With DataFast](./DevDocs/7_Setting_Up_Analytics_With_DataFast.md)
- [UI Components Guide](./DevDocs/0_UI_Components_Guide.md)

### [DevPlanDocs](./DevPlanDocs)

Architecture and development planning documents:

- [Architecture Overview](./DevPlanDocs/1-Architecture-Overview.md)
- [Components Overview](./DevPlanDocs/2-Components-Overview.md)
- [Development Plan](./DevPlanDocs/3-Development-Plan.md)
- [API Endpoints](./DevPlanDocs/4-API-Endpoints.md)
- [Database Models](./DevPlanDocs/5-Database-Models.md)
- [Authentication System](./DevPlanDocs/6-Authentication-System.md)
- [Payment Integration](./DevPlanDocs/7-Payment-Integration.md)
- [Rebranding Strategy](./DevPlanDocs/8-Rebranding-Strategy.md)

## Features

- **User Authentication**: Google OAuth and Magic Links
- **Database Integration**: MongoDB Atlas setup
- **Payment Processing**: Stripe integration
- **Email Service**: Resend.com integration
- **SEO Optimization**: Built-in SEO features
- **Analytics**: DataFast integration
- **UI Components**: Modern, responsive design with TailwindCSS and DaisyUI
- **AI Integration**: OpenAI, ElevenLabs, and more

## Support

For questions or support, please reach out to support@fenago.com
