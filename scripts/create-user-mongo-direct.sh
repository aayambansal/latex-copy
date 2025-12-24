#!/bin/bash
# Create user directly in MongoDB
# Usage: ./create-user-mongo-direct.sh email@example.com password

EMAIL=${1:-"aayambansal@gmail.com"}
PASSWORD=${2:-"aayam"}

echo "Creating user: $EMAIL"
echo ""

# Generate bcrypt hash (requires node or bcrypt)
# For now, we'll use mongosh to insert with a pre-hashed password
# You need to hash the password first using Node.js

echo "To create user, run this in the inkvell container:"
echo ""
echo "docker compose exec inkvell node -e \""
echo "const bcrypt = require('bcrypt');"
echo "bcrypt.hash('$PASSWORD', 12, (err, hash) => {"
echo "  if (err) { console.error(err); process.exit(1); }"
echo "  const { MongoClient } = require('mongodb');"
echo "  MongoClient.connect('mongodb://mongo/inkvell', (err, client) => {"
echo "    if (err) { console.error(err); process.exit(1); }"
echo "    const db = client.db('inkvell');"
echo "    db.collection('users').insertOne({"
echo "      email: '$EMAIL',"
echo "      hashedPassword: hash,"
echo "      firstName: 'Aayam',"
echo "      lastName: 'Bansal',"
echo "      loginEpoch: 0"
echo "    }, (err, result) => {"
echo "      if (err) { console.error(err); process.exit(1); }"
echo "      console.log('User created:', result.insertedId);"
echo "      client.close();"
echo "    });"
echo "  });"
echo "});"
echo "\""

