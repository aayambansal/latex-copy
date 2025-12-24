import { createClient } from '@supabase/supabase-js'
import Settings from '@overleaf/settings'
import logger from '@overleaf/logger'

const SUPABASE_URL = Settings.supabase?.url || process.env.SUPABASE_URL || 'https://ikbtchgrensgpvzthwqp.supabase.co'
// Use service role key for backend operations (bypasses RLS)
const SUPABASE_SERVICE_KEY = Settings.supabase?.serviceKey || process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRjaGdyZW5zZ3B2enRod3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjYwNTkxNywiZXhwIjoyMDgyMTgxOTE3fQ.HsXH0UCoxUGCqoX7WtSH2ai5gWIx-5kHOX1E5XZfwpY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const SupabaseService = {
  /**
   * Get or create user in Supabase
   */
  async getUserByEmail(email) {
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
    return supabase
  }
}

export default SupabaseService

