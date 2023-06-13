const { Router } = require('express')

const router = Router()

router.use('/courses', require('./courses'))
router.use('/assignments', require('./assignments'))
router.use('/users', require('./users'))

module.exports = router
