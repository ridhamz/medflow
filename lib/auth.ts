// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "./db"
import { PrismaAdapter } from "@auth/prisma-adapter"

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // basePath: "/api/auth",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
            },
            include: {
              clinic: true,
              patient: true,
              doctor: true,
            },
          })

          if (!user) {
            console.log("User not found:", credentials.email)
            return null
          }

          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Password invalid for:", credentials.email)
            return null
          }

          console.log("Auth successful for:", credentials.email)
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            clinicId: user.clinicId,
            name: user.patient 
              ? `${user.patient.firstName} ${user.patient.lastName}`
              : user.email,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.clinicId = user.clinicId
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.clinicId = token.clinicId as string | null
        session.user.id = token.id as string
      }
      return session
    },
  },
  trustHost: true,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions as any)

// Type augmentation for NextAuth
declare module "next-auth" {
  interface User {
    role?: string
    clinicId?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      role: string
      clinicId: string | null
      name?: string | null
    }
  }
}