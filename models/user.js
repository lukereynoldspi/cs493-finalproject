/*
 * User schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a user object.
 */
const UserSchema = {
  role: { required: true },
}
exports.UserSchema = UserSchema

/*
 * Executes a DB query to insert a new user into the database.  Returns
 * a Promise that resolves to the ID of the newly-created user entry.
 */
async function insertNewUser(user) {
  user = extractValidFields(user, UserSchema)
  user.businessId = ObjectId(user.businessId)
  const db = getDbReference()
  const collection = db.collection('users')
  const result = await collection.insertOne(user)
  return result.insertedId
}
exports.insertNewUser = insertNewUser

/*
 * Executes a DB query to fetch a single specified user based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * user.  If no user with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getUserById(id) {
  const db = getDbReference()
  const collection = db.collection('users')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray()
    return results[0]
  }
}
exports.getUserById = getUserById
