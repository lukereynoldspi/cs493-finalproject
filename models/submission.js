/*
 * Submission schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

/*
 * Schema describing required/optional fields of a submission object.
 */
const SubmissionSchema = {
  student: { required: true },
  time: { required: true },
  file: { required: true }
}
exports.SubmissionSchema = SubmissionSchema

/*
 * Executes a DB query to insert a new submission into the database.  Returns
 * a Promise that resolves to the ID of the newly-created submission entry.
 */
async function insertNewSubmission(submission) {
  submission = extractValidFields(submission, SubmissionSchema)
  submission.businessId = ObjectId(submission.businessId)
  const db = getDbReference()
  const collection = db.collection('submissions')
  const result = await collection.insertOne(submission)
  return result.insertedId
}
exports.insertNewSubmission = insertNewSubmission

/*
 * Executes a DB query to fetch a single specified submission based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * submission.  If no submission with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getSubmissionById(id) {
  const db = getDbReference()
  const collection = db.collection('submissions')
  if (!ObjectId.isValid(id)) {
    return null
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray()
    return results[0]
  }
}
exports.getSubmissionById = getSubmissionById
