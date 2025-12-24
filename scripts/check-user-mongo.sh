#!/bin/bash
# Check if user exists in MongoDB
# Usage: ./check-user-mongo.sh email@example.com

EMAIL=${1:-"aayambansal@gmail.com"}

echo "Checking for user: $EMAIL"
echo ""

docker compose exec mongo mongosh inkvell --quiet --eval "
db.users.findOne({ email: '$EMAIL' }, { 
  email: 1, 
  hashedPassword: 1, 
  firstName: 1, 
  lastName: 1,
  _id: 1,
  loginEpoch: 1
})
"

echo ""
echo "To check all users:"
echo "docker compose exec mongo mongosh inkvell --quiet --eval \"db.users.find({}, {email: 1, _id: 1}).limit(10)\""

