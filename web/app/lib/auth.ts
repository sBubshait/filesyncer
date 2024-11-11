import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import AppleProvider from "next-auth/providers/apple";
import { cookies } from "next/headers";
import { generateServerToken } from "./serverTokens";

const API_URL = process.env.API_URL || "http://localhost:3000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID!,
      clientSecret: process.env.FACEBOOK_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_API_KEY!,
      clientSecret: process.env.TWITTER_API_SECRET_KEY!,
      version: "2.0",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user) {
        try {
          // Generate server token that includes the user ID
          const serverToken = generateServerToken(user.id);

          // Request API key from server only during sign in
          const response = await fetch(`${API_URL}/getAPIKey`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serverToken}`,
            },
            body: JSON.stringify({
              id: user.id,
              provider: account?.provider,
              secret: serverToken,
            }),
          });

          if (!response.ok) {
            return false; // Prevent sign in if API key generation fails
          }

          const { apiKey } = await response.json();

          // Store API key in cookies
          cookies().set("token", apiKey, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60, // 1 year
          });
        } catch (error) {
          console.error("Error getting API key:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // If the url is just "/api/auth/signin", redirect to "/"
      if (url.endsWith("/api/auth/signin")) {
        return "/";
      }

      // If it's an internal URL (starts with baseUrl), use it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // For external URLs, you can either:
      // 1. Allow all external redirects:
      return url;

      // 2. Or use a whitelist approach:
      /*
        const allowedExternalDomains = [
          'http://localhost:3000',
          'http://localhost:3001',
          process.env.NEXT_PUBLIC_DESKTOP_APP_URL,
          process.env.NEXT_PUBLIC_WEB_APP_URL,
        ].filter(Boolean) as string[];
  
        if (allowedExternalDomains.some(domain => url.startsWith(domain))) {
          return url;
        }
  
        // If no valid callback URL is found, redirect to home
        return '/';
        */
    },
  },
  events: {
    signOut: async () => {
      // Clear the token cookie on sign out
      cookies().delete("token");
    },
  },
};
