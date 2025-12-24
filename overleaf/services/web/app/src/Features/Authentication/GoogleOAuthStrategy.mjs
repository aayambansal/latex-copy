import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Settings from '@overleaf/settings'
import logger from '@overleaf/logger'
import SupabaseService from './SupabaseService.mjs'
import { User } from '../../models/User.mjs'
import AuthenticationController from './AuthenticationController.mjs'

// Google OAuth credentials - must be set via environment variables or settings
const GOOGLE_CLIENT_ID = Settings.googleOAuth?.clientId || process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = Settings.googleOAuth?.clientSecret || process.env.GOOGLE_CLIENT_SECRET

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  logger.warn({}, 'Google OAuth credentials not configured. Google login will not work.')
}

// Build full callback URL from site URL
const getCallbackURL = () => {
  if (Settings.googleOAuth?.callbackURL) {
    return Settings.googleOAuth.callbackURL
  }
  if (process.env.GOOGLE_CALLBACK_URL) {
    // If it's already a full URL, use it; otherwise prepend site URL
    if (process.env.GOOGLE_CALLBACK_URL.startsWith('http')) {
      return process.env.GOOGLE_CALLBACK_URL
    }
    return `${Settings.siteUrl || 'http://localhost'}${process.env.GOOGLE_CALLBACK_URL}`
  }
  // Default: use site URL + callback path
  const siteUrl = Settings.siteUrl || process.env.OVERLEAF_SITE_URL || 'http://localhost'
  return `${siteUrl}/auth/google/callback`
}

const CALLBACK_URL = getCallbackURL()

export function setupGoogleStrategy() {
  // Skip Google OAuth setup if credentials are not configured
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    logger.warn({}, 'Skipping Google OAuth strategy setup - credentials not configured')
    return
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          const googleId = profile.id
          const firstName = profile.name?.givenName || ''
          const lastName = profile.name?.familyName || ''
          const displayName = profile.displayName || `${firstName} ${lastName}`.trim()

          if (!email) {
            return done(new Error('No email found in Google profile'))
          }

          logger.info({ email, googleId }, 'Google OAuth callback received')

          // Check Supabase first
          let supabaseUser = await SupabaseService.getUserByGoogleId(googleId)
          
          if (!supabaseUser) {
            // Check by email
            supabaseUser = await SupabaseService.getUserByEmail(email)
          }

          // Create or update in Supabase
          if (!supabaseUser) {
            supabaseUser = await SupabaseService.createUser({
              email,
              google_id: googleId,
              first_name: firstName,
              last_name: lastName,
              display_name: displayName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            logger.info({ email, googleId }, 'Created new user in Supabase')
          } else {
            // Update Google ID if not set
            if (!supabaseUser.google_id) {
              await SupabaseService.updateUser(supabaseUser.id, {
                google_id: googleId,
                updated_at: new Date().toISOString(),
              })
            }
          }

          // Find or create user in MongoDB (for Overleaf compatibility)
          let user = await User.findOne({ email }).exec()

          if (!user) {
            // Create new user in MongoDB
            user = new User({
              email,
              first_name: firstName,
              last_name: lastName,
              emails: [
                {
                  email,
                  confirmedAt: new Date(),
                },
              ],
              signUpDate: new Date(),
              loginEpoch: 0,
              loginCount: 0,
            })
            await user.save()
            logger.info({ email, userId: user._id, googleId }, 'Created new user account via Google OAuth')
          } else {
            // Update user info if needed
            if (!user.first_name && firstName) {
              user.first_name = firstName
            }
            if (!user.last_name && lastName) {
              user.last_name = lastName
            }
            // Update last login
            user.lastLoggedIn = new Date()
            user.loginEpoch = (user.loginEpoch || 0) + 1
            user.loginCount = (user.loginCount || 0) + 1
            await user.save()
            logger.info({ email, userId: user._id }, 'User logged in via Google OAuth')
          }

          return done(null, user)
        } catch (err) {
          logger.err({ err, profile }, 'Error in Google OAuth strategy')
          return done(err)
        }
      }
    )
  )
}

export default setupGoogleStrategy

