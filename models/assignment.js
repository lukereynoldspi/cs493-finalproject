/*
 * Assignment schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a assignment object.
 */
const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true },
  studentSubmissions: { required: true }
}
exports.AssignmentSchema = AssignmentSchema

/*
 * Executes a DB query to insert a new assignment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created assignment entry.
 */
async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema)
  assignment.businessId = ObjectId(assignment.businessId)
  const db = getDbReference()
  const collection = db.collection('assignments')
  const result = await collection.insertOne(assignment)
  return result.insertedId
}
exports.insertNewAssignment = insertNewAssignment

/*
 * Executes a DB query to fetch a single specified assignment based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * assignment.  If no assignment with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getAssignmentById(id) {
  const db = getDbReference()
  const collection = db.collection('assignments')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray()
    return results[0]
  }
}
exports.getAssignmentById = getAssignmentById
