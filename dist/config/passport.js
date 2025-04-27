"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_facebook_1 = require("passport-facebook");
const passport_apple_1 = require("passport-apple");
const prisma_1 = require("../lib/prisma");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../config/index");
// Configure Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: index_1.config.oauth.google.clientId,
    clientSecret: index_1.config.oauth.google.clientSecret,
    callbackURL: `${index_1.config.apiUrl}/api/v1/auth/google/callback`,
    scope: ["profile", "email"],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await prisma_1.prisma.user.findFirst({
            where: {
                email: profile.emails?.[0].value,
            },
        });
        if (!user) {
            // Create new user
            user = await prisma_1.prisma.user.create({
                data: {
                    email: profile.emails?.[0].value,
                    first_name: profile.name?.givenName || "Google",
                    last_name: profile.name?.familyName || "User",
                    phone_number: `google_${Date.now()}`, // Placeholder
                    password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
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
            });
        }
        else {
            // Check if social login exists
            const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                where: {
                    userId: user.id,
                    provider: "GOOGLE",
                },
            });
            if (!socialLogin) {
                // Add social login
                await prisma_1.prisma.socialLogin.create({
                    data: {
                        userId: user.id,
                        provider: "GOOGLE",
                        providerId: profile.id,
                    },
                });
            }
        }
        return done(null, user);
    }
    catch (error) {
        logger_1.logger.error(`Error in Google authentication: ${error}`);
        return done(error, undefined);
    }
}));
// Configure Facebook Strategy
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: index_1.config.oauth.facebook.appId,
    clientSecret: index_1.config.oauth.facebook.appSecret,
    callbackURL: `${process.env.API_URL}/api/v1/auth/facebook/callback`,
    profileFields: ["id", "emails", "name", "picture.type(large)"],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await prisma_1.prisma.user.findFirst({
            where: {
                email: profile.emails?.[0].value,
            },
        });
        if (!user) {
            // Create new user
            user = await prisma_1.prisma.user.create({
                data: {
                    email: profile.emails?.[0].value,
                    first_name: profile.name?.givenName || "Facebook",
                    last_name: profile.name?.familyName || "User",
                    phone_number: `facebook_${Date.now()}`, // Placeholder
                    password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
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
        }
        else {
            // Check if social login exists
            const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                where: {
                    userId: user.id,
                    provider: "FACEBOOK",
                },
            });
            if (!socialLogin) {
                // Add social login
                await prisma_1.prisma.socialLogin.create({
                    data: {
                        userId: user.id,
                        provider: "FACEBOOK",
                        providerId: profile.id,
                    },
                });
            }
        }
        return done(null, user);
    }
    catch (error) {
        logger_1.logger.error(`Error in Facebook authentication: ${error}`);
        return done(error, undefined);
    }
}));
// Configure Apple Strategy
passport_1.default.use(new passport_apple_1.Strategy({
    clientID: index_1.config.oauth.apple.clientId,
    clientSecret: index_1.config.oauth.apple.clientSecret,
    callbackURL: `${index_1.config.apiUrl}/api/v1/auth/apple/callback`,
    passReqToCallback: true,
    teamID: index_1.config.oauth.apple.teamId,
    keyID: index_1.config.oauth.apple.keyId,
    authorizationURL: "",
    tokenURL: "",
}, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
        // Parse the id token to get user info
        const tokenPayload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
        if (!tokenPayload.email) {
            return done(new Error("Email not provided by Apple"), undefined);
        }
        // Check if user exists
        let user = await prisma_1.prisma.user.findFirst({
            where: {
                email: tokenPayload.email,
            },
        });
        if (!user) {
            // Get name from request (Apple sends name only on first login)
            const firstName = req.body?.firstName || "Apple";
            const lastName = req.body?.lastName || "User";
            // Create new user
            user = await prisma_1.prisma.user.create({
                data: {
                    email: tokenPayload.email,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: `apple_${Date.now()}`, // Placeholder
                    password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
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
        }
        else {
            // Check if social login exists
            const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                where: {
                    userId: user.id,
                    provider: "APPLE",
                },
            });
            if (!socialLogin) {
                // Add social login
                await prisma_1.prisma.socialLogin.create({
                    data: {
                        userId: user.id,
                        provider: "APPLE",
                        providerId: tokenPayload.sub,
                    },
                });
            }
        }
        return done(null, user);
    }
    catch (error) {
        logger_1.logger.error(`Error in Apple authentication: ${error}`);
        return done(error, undefined);
    }
}));
// Serialize user to session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, role: true },
        });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map