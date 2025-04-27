import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as FacebookStrategy } from "passport-facebook"
import { Strategy as AppleStrategy } from "passport-apple"
import { prisma } from "../lib/prisma"
import { logger } from "../utils/logger"
import crypto from "crypto"
import {config} from "../config/index"
// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.oauth.google.clientId as string,
      clientSecret: config.oauth.google.clientSecret as string,
      callbackURL: `${config.apiUrl}/api/v1/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            email: profile.emails?.[0].value,
          },
        })

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value as string,
              first_name: profile.name?.givenName || "Google",
              last_name: profile.name?.familyName || "User",
              phone_number: `google_${Date.now()}`, // Placeholder
              password_hash: crypto.randomBytes(16).toString("hex"), // Random password
              role: "USER",
              email_verified: true, // Google already verified the email
              Profile: {
                create: {
                  bio: "",
                  theme: "light",
                  language: "en",
                  profile_picture: profile.photos?.[0].value,
                },
              },
              socialLogins: {
                create: {
                  provider: "GOOGLE",
                  providerId: profile.id,
                },
              },
            },
          })
        } else {
          // Check if social login exists
          const socialLogin = await prisma.socialLogin.findFirst({
            where: {
              userId: user.id,
              provider: "GOOGLE",
            },
          })

          if (!socialLogin) {
            // Add social login
            await prisma.socialLogin.create({
              data: {
                userId: user.id,
                provider: "GOOGLE",
                providerId: profile.id,
              },
            })
          }
        }

        return done(null, user)
      } catch (error) {
        logger.error(`Error in Google authentication: ${error}`)
        return done(error as Error, undefined)
      }
    },
  ),
)

// Configure Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: config.oauth.facebook.appId as string,
      clientSecret: config.oauth.facebook.appSecret as string,
      callbackURL: `${process.env.API_URL}/api/v1/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            email: profile.emails?.[0].value,
          },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value as string,
              first_name: profile.name?.givenName || "Facebook",
              last_name: profile.name?.familyName || "User",
              phone_number: `facebook_${Date.now()}`, // Placeholder
              password_hash: crypto.randomBytes(16).toString("hex"), // Random password
              role: "USER",
              email_verified: true, // Facebook already verified the email
              Profile: {
                create: {
                  bio: "",
                  theme: "light",
                  language: "en",
                  profile_picture: profile.photos?.[0].value,
                },
              },
              socialLogins: {
                create: {
                  provider: "FACEBOOK",
                  providerId: profile.id,
                },
              },
            },
          });
        } else {
          // Check if social login exists
          const socialLogin = await prisma.socialLogin.findFirst({
            where: {
              userId: user.id,
              provider: "FACEBOOK",
            },
          });

          if (!socialLogin) {
            // Add social login
            await prisma.socialLogin.create({
              data: {
                userId: user.id,
                provider: "FACEBOOK",
                providerId: profile.id,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Error in Facebook authentication: ${error}`);
        return done(error as Error, undefined);
      }
    }
  )
);

// Configure Apple Strategy
passport.use(
  new AppleStrategy(
    {
      clientID: config.oauth.apple.clientId as string,
      clientSecret: config.oauth.apple.clientSecret as string,
      callbackURL: `${config.apiUrl}/api/v1/auth/apple/callback`,
      passReqToCallback: true,
      teamID: config.oauth.apple.teamId as string,
      keyID: config.oauth.apple.keyId as string,
      authorizationURL: "",
      tokenURL: "",
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        // Parse the id token to get user info
        const tokenPayload = JSON.parse(
          Buffer.from(idToken.split(".")[1], "base64").toString()
        ) as {
          email?: string;
          sub: string;
          email_verified?: boolean;
        };

        if (!tokenPayload.email) {
          return done(new Error("Email not provided by Apple"), undefined);
        }

        // Check if user exists
        let user = await prisma.user.findFirst({
          where: {
            email: tokenPayload.email,
          },
        });

        if (!user) {
          // Get name from request (Apple sends name only on first login)
          const firstName = req.body?.firstName || "Apple";
          const lastName = req.body?.lastName || "User";

          // Create new user
          user = await prisma.user.create({
            data: {
              email: tokenPayload.email,
              first_name: firstName,
              last_name: lastName,
              phone_number: `apple_${Date.now()}`, // Placeholder
              password_hash: crypto.randomBytes(16).toString("hex"), // Random password
              role: "USER",
              email_verified: !!tokenPayload.email_verified, // Use email_verified from token if available
              Profile: {
                create: {
                  bio: "",
                  theme: "light",
                  language: "en",
                },
              },
              socialLogins: {
                create: {
                  provider: "APPLE",
                  providerId: tokenPayload.sub,
                },
              },
            },
          });
        } else {
          // Check if social login exists
          const socialLogin = await prisma.socialLogin.findFirst({
            where: {
              userId: user.id,
              provider: "APPLE",
            },
          });

          if (!socialLogin) {
            // Add social login
            await prisma.socialLogin.create({
              data: {
                userId: user.id,
                provider: "APPLE",
                providerId: tokenPayload.sub,
              },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        logger.error(`Error in Apple authentication: ${error}`);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport
