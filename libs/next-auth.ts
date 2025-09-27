import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter: any;
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(),
          role: 'USER', // Default role for new users
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    ...(connectMongo
      ? [
          EmailProvider({
            server: {
              host: "smtp.resend.com",
              port: 465,
              auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: config.resend.fromNoReply,
          }),
        ]
      : []),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
        
        // Add user role to session if available
        if (token.role) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
    jwt: async ({ token, user, account }) => {
      // Always check and update role from database on every token refresh
      if (token.email) {
        try {
          const connectMongo = (await import('./mongoose')).default;
          const User = (await import('@/models/User')).default;
          const { UserRoles } = await import('@/models/User');
          
          await connectMongo();
          
          // Add timeout to prevent hanging
          let dbUser = await Promise.race([
            User.findOne({ email: token.email }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
          ]) as any;
          
          // Auto-assign ADMIN role for specific email
          if (token.email === 'learningscienceai1@gmail.com' && (!dbUser || dbUser.role !== UserRoles.ADMIN)) {
            if (!dbUser) {
              // Create admin user if doesn't exist
              dbUser = new User({
                name: token.name || 'TuneForge Admin',
                email: token.email,
                image: token.picture,
                role: UserRoles.ADMIN,
                emailVerified: new Date(),
                adminData: {
                  permissions: ['all'],
                  lastAdminAction: new Date(),
                  adminNotes: 'Auto-created admin user',
                },
                subscription: {
                  status: 'active',
                  plan: 'MAX',
                },
              });
            } else {
              // Update existing user to admin
              dbUser.role = UserRoles.ADMIN;
              dbUser.adminData = {
                permissions: ['all'],
                lastAdminAction: new Date(),
                adminNotes: 'Auto-updated to admin',
              };
              dbUser.subscription = {
                ...dbUser.subscription,
                status: 'active',
                plan: 'MAX',
              };
            }
            await dbUser.save();
          }
          
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Error fetching/updating user role:', error);
        }
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `/icon.png`, // Using the icon from the app root
  },
};

export default NextAuth(authOptions);
