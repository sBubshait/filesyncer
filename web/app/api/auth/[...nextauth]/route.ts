
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const allowedUser = {
  username: process.env.USERNAME || "admin",
  password: process.env.PASSWORD || "password"
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (
          credentials?.username === allowedUser.username &&
          credentials?.password === allowedUser.password
        ) {
          return { id: "1", name: "Admin User" }; // Just a dummy user
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user ? true : false;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };