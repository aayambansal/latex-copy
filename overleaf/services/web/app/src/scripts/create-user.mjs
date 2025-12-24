#!/usr/bin/env node
/**
 * Script to create a test user with email/password
 * Run inside Docker: docker exec inkvell node /overleaf/services/web/app/src/scripts/create-user.mjs
 */

import { User } from '../../models/User.mjs'
import AuthenticationManager from '../../Features/Authentication/AuthenticationManager.mjs'
import UserCreator from '../../Features/User/UserCreator.mjs'
import UserGetter from '../../Features/User/UserGetter.mjs'
import Settings from '@overleaf/settings'
import mongoose from 'mongoose'

const email = 'aayambansal@gmail.com'
const password = 'aayam'
const firstName = 'Aayam'
const lastName = 'Bansal'

async function createUser() {
  try {
    console.log('Creating user:', email)
    
    // Connect to MongoDB using the same connection as the app
    const mongoUrl = Settings.mongo?.url || process.env.MONGO_URL || 'mongodb://mongo:27017/inkvell'
    console.log('Connecting to MongoDB...')
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUrl)
      console.log('Connected to MongoDB')
    }

    // Check if user already exists
    let user = await UserGetter.promises.getUserByAnyEmail(email)
    
    if (user) {
      console.log('User already exists, updating password...')
      await AuthenticationManager.promises.setUserPassword(user, password)
      console.log('✓ Password updated')
    } else {
      // Create new user
      console.log('Creating new user...')
      user = await UserCreator.promises.createNewUser({
        email,
        first_name: firstName,
        last_name: lastName,
      }, {
        confirmedAt: new Date(),
      })
      
      // Set password
      await AuthenticationManager.promises.setUserPassword(user, password)
      console.log('✓ User created with password')
    }

    console.log('\n✅ User creation complete!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', user._id)
    console.log('\nYou can now login at: http://localhost/login')

    process.exit(0)
  } catch (error) {
    console.error('✗ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

createUser()

