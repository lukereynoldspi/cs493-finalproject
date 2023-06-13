/*
 * API sub-router for businesses collection endpoints.
 */

const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const {
  AssignmentSchema,
  insertNewAssignment,
  getAssignmentById
} = require('../models/assignment')

const router = Router()

/*
 * POST /assignments - Route to create a new assignment.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body)
      res.status(201).send({
        id: id,
        links: {
          assignment: `/assignments/${id}`,
          course: `/courses/${req.body.courseId}`
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting assignment into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid assignment object"
    })
  }
})

/*
 * GET /assignments/{id} - Route to fetch info about a specific assignment.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(req.params.id)
    if (assignment) {
      res.status(200).send(assignment)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch assignment.  Please try again later."
    })
  }
})

module.exports = router
