
const { Router } = require('express')

const { validateAgainstSchema } = require('../lib/validation')
const {
  UserSchema,
  insertNewUser,
  getUserById
} = require('../models/user')

const router = Router()

/*
 * POST /users - Route to create a new user.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      const id = await insertNewUser(req.body)
      res.status(201).send({
        id: id,
        links: {
          user: `/users/${id}`,
          course: `/courses/${req.body.courseId}`
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting user into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid user object"
    })
  }
})

/*
 * GET /users/{id} - Route to fetch info about a specific user.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id)
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch user.  Please try again later."
    })
  }
})

module.exports = router
