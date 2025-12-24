#!/usr/bin/env node
/**
 * Script to create a test user with email/password
 * Usage: node create-test-user.mjs
 */

import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'
import { createClient } from '@supabase/supabase-js'
import Settings from '@overleaf/settings'

const BCRYPT_ROUNDS = 12
const BCRYPT_MINOR_VERSION = 'a'

const email = 'aayambansal@gmail.com'
const password = 'aayam'
const firstName = 'Aayam'
const lastName = 'Bansal'

async function createUser() {
  console.log('Creating user:', email)
  
  // Hash password
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS, BCRYPT_MINOR_VERSION)
  const hashedPassword = await bcrypt.hash(password, salt)
  console.log('Password hashed successfully')

  // Connect to MongoDB
  const mongoUrl = process.env.MONGO_URL || process.env.OVERLEAF_MONGO_URL || 'mongodb://localhost:27017/inkvell'
  console.log('Connecting to MongoDB:', mongoUrl.replace(/\/\/.*@/, '//***@'))
  const mongoClient = new MongoClient(mongoUrl)
  
  try {
    await mongoClient.connect()
    const db = mongoClient.db()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      console.log('User already exists in MongoDB, updating password...')
      await usersCollection.updateOne(
        { email },
        {
          $set: {
            hashedPassword,
            first_name: firstName,
            last_name: lastName,
            emails: [{
              email,
              confirmedAt: new Date(),
              createdAt: new Date(),
            }],
            updatedAt: new Date(),
          }
        }
      )
      console.log('✓ User updated in MongoDB')
    } else {
      // Create new user in MongoDB
      const userDoc = {
        email,
        first_name: firstName,
        last_name: lastName,
        hashedPassword,
        emails: [{
          email,
          confirmedAt: new Date(),
          createdAt: new Date(),
        }],
        signUpDate: new Date(),
        loginEpoch: 0,
        loginCount: 0,
        holdingAccount: false,
        ace: {
          syntaxValidation: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const result = await usersCollection.insertOne(userDoc)
      console.log('✓ User created in MongoDB with ID:', result.insertedId)
    }

    // Connect to Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://ikbtchgrensgpvzthwqp.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
    console.log('Connecting to Supabase...')
    
    if (!supabaseKey) {
      console.warn('⚠ Supabase key not found, skipping Supabase user creation')
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Check if user exists in Supabase
      const { data: existingSupabaseUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingSupabaseUser) {
        console.log('User already exists in Supabase, updating...')
        const { error } = await supabase
          .from('users')
          .update({
            hashed_password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email)
        
        if (error) {
          console.error('✗ Error updating user in Supabase:', error.message)
        } else {
          console.log('✓ User updated in Supabase')
        }
      } else {
        // Create new user in Supabase
        const { data, error } = await supabase
          .from('users')
          .insert([{
            email,
            hashed_password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single()

        if (error) {
          console.error('✗ Error creating user in Supabase:', error.message)
        } else {
          console.log('✓ User created in Supabase with ID:', data.id)
        }
      }
    }

    console.log('\n✅ User creation complete!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('\nYou can now login at: http://localhost/login')

  } catch (error) {
    console.error('✗ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await mongoClient.close()
  }
}

createUser()

