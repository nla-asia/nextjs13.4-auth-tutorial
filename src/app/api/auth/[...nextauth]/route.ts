
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { NextApiRequest, NextApiResponse } from "next/types"

const API_URL = "http://127.0.0.1:8000/api/login"

async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          username: { label: "Username", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          // You need to provide your own logic here that takes the credentials
          // submitted and returns either a object representing a user or value
          // that is false/null if the credentials are invalid.
          // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
          // You can also use the `req` object to obtain additional parameters
          // (i.e., the request IP address)
          const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                email : credentials?.username,
                password: credentials?.password
            }),
            headers: { "Content-Type": "application/json", "Accept": "application/json" }
          })
          const data = await res.json()
    
          // If no error and we have user data, return it
          if (res.ok && data) {
            let user = data.user;
                user.access_token = data.access_token;
            return user
          }
          // Return null if user data could not be retrieved
          return null
        }
      }),
  ]


  return await NextAuth(req, res, {
    providers,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/signout',
        error: '/auth/login', // Error code passed in query string as ?error=
        //verifyRequest: '/auth/verify-request', // (used for check email message)
       // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
    }
  })
}

export { auth as GET, auth as POST }

