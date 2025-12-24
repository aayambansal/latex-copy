import { createClient } from '@supabase/supabase-js'
import Settings from '@overleaf/settings'
import logger from '@overleaf/logger'

const SUPABASE_URL = Settings.supabase?.url || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = Settings.supabase?.serviceKey || process.env.SUPABASE_SERVICE_KEY

// Only create Supabase client if credentials are provided
// This makes Supabase optional - service won't crash if not configured
let supabase = null
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    logger.info({}, 'Supabase client initialized')
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize Supabase client - Google OAuth will not work')
  }
} else {
  logger.warn({}, 'Supabase not configured - Google OAuth will not be available')
}

const SupabaseService = {
  /**
   * Get or create user in Supabase
   */
  async getUserByEmail(email) {
    if (!supabase) {
      logger.warn({ email }, 'Supabase not configured - cannot fetch user')
      return null
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.err({ error, email }, 'Error fetching user from Supabase')
        throw error
      }

      return data
    } catch (err) {
      logger.err({ err, email }, 'Error in getUserByEmail')
      throw err
    }
  },

  /**
   * Create user in Supabase
   */
  async createUser(userData) {
    if (!supabase) {
      logger.warn({ userData }, 'Supabase not configured - cannot create user')
      return null
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) {
        logger.err({ error, userData }, 'Error creating user in Supabase')
        throw error
      }

      return data
    } catch (err) {
      logger.err({ err, userData }, 'Error in createUser')
      throw err
    }
  },

  /**
   * Update user in Supabase
   */
  async updateUser(userId, updates) {
    if (!supabase) {
      logger.warn({ userId, updates }, 'Supabase not configured - cannot update user')
      return null
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        logger.err({ error, userId, updates }, 'Error updating user in Supabase')
        throw error
      }

      return data
    } catch (err) {
      logger.err({ err, userId, updates }, 'Error in updateUser')
      throw err
    }
  },

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId) {
    if (!supabase) {
      logger.warn({ googleId }, 'Supabase not configured - cannot fetch user by Google ID')
      return null
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single()

      if (error && error.code !== 'PGRST116') {
        logger.err({ error, googleId }, 'Error fetching user by Google ID')
        throw error
      }

      return data
    } catch (err) {
      logger.err({ err, googleId }, 'Error in getUserByGoogleId')
      throw err
    }
  },

  /**
   * Get Supabase client (for advanced queries)
   */
  getClient() {
    if (!supabase) {
      logger.warn({}, 'Supabase not configured - cannot return client')
      return null
    }
    return supabase
  }
}

export default SupabaseService

