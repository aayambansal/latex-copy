#!/usr/bin/env node
/**
 * Script to create a test user - run inside Docker container
 * Usage: docker exec inkvell node /path/to/create-user.js
 */

const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')

const email = 'aayambansal@gmail.com'
const password = 'aayam'
const firstName = 'Aayam'
const lastName = 'Bansal'

async function createUser() {
  console.log('Creating user:', email)
  
  // Hash password
  const salt = await bcrypt.genSalt(12, 'a')
  const hashedPassword = await bcrypt.hash(password, salt)
  console.log('Password hashed successfully')

  // Connect to MongoDB
  const mongoUrl = process.env.MONGO_URL || process.env.OVERLEAF_MONGO_URL || 'mongodb://mongo:27017/inkvell'
  console.log('Connecting to MongoDB...')
  const mongoClient = new MongoClient(mongoUrl)
  
  try {
    await mongoClient.connect()
    const db = mongoClient.db()
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      console.log('User already exists, updating password...')
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
            holdingAccount: false,
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

