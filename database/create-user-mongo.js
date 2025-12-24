// MongoDB script to create user - run with mongosh
// Usage: docker exec inkvell mongosh mongodb://mongo:27017/inkvell --file /tmp/create-user-mongo.js

const email = 'aayambansal@gmail.com'
const password = 'aayam'
const firstName = 'Aayam'
const lastName = 'Bansal'

// Note: This requires bcrypt hash - we'll generate it separately
// For now, let's use a simple approach - we'll hash it using Node.js first

print('Creating user:', email)

// Check if user exists
const existingUser = db.users.findOne({ email: email })

if (existingUser) {
  print('User already exists, updating...')
  // We need to update with hashed password - will do this via Node.js script
  print('Please run the Node.js script to update password')
} else {
  print('User does not exist yet')
  print('Please run: docker exec inkvell node /overleaf/services/web/app/src/scripts/create-user.mjs')
}

