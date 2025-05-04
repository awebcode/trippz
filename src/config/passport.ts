import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as AppleStrategy } from "passport-apple";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { config } from "../config";
import { AuthService } from "../services/authService";

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
        if (!profile.emails?.[0].value) {
          return done(new Error("Email not provided by Google"), undefined);
        }

        const user = await AuthService.googleLogin(profile || "");
        return done(null, user);
      } catch (error) {
        logger.error(`Error in Google authentication: ${error}`);
        return done(error as Error, undefined);
      }
    }
  )
);

// Configure Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: config.oauth.facebook.appId as string,
      clientSecret: config.oauth.facebook.appSecret as string,
      callbackURL: `${config.apiUrl}/api/v1/auth/facebook/callback`,
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails?.[0].value) {
          return done(new Error("Email not provided by Facebook"), undefined);
        }

        const user = await AuthService.facebookLogin(accessToken);
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
      authorizationURL: "https://appleid.apple.com/auth/authorize",
      tokenURL: "https://appleid.apple.com/auth/token",
    },
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        const user = await AuthService.appleLogin(
          idToken,
          req.body?.firstName,
          req.body?.lastName
        );
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
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
