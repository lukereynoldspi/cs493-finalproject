const express = require('express');
const router = express.Router();
const AssignmentSchema = require('../models/assignment');
const submissionSchema = require('../models/submission');
const jwtMiddleware = require('../jwtMiddleware');
const rateLimit = require('express-rate-limit');
exports.router = router;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests from thi IP, please try again in a minute'
});

router.get('/',limiter, jwtMiddleware, async (req, res) => {
  try {
    const assignments = await AssignmentSchema.find();
    res.status(200).json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting assignments' });
  }
});

router.get('/:assignmentId', limiter, jwtMiddleware, async (req, res) => {
  const assignmentId = req.params.assignmentId;
  try {
    const assignment = await AssignmentSchema.findById( assignmentId );
    res.status(200).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting assignment' });
  }
});

router.post('/', limiter, jwtMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const assignmentData = req.body;
  const newAssignment = new AssignmentSchema(assignmentData);
  newAssignment.save().then(() => {
    res.status(201).json({ id: newAssignment.assignmentId });
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      error: 'Error creating assignment'
    });
  });
});

router.patch('/:assignmentId', limiter, jwtMiddleware, async (req, res) => {
  try {
    const assignment = await AssignmentSchema.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    assignment.set(req.body);
    await assignment.save();
    res.status(200).json(assignment);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating assignment' });
  }
});

router.delete('/:assignmentId', limiter, jwtMiddleware, async (req, res) => {
  try {
    const assignment = await AssignmentSchema.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    await assignment.remove();
    res.status(200).json({ message: 'Assignment deleted' });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting assignment' });
  }
});

router.get('/:assignmentId/submissions', limiter, jwtMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  };
  try {
    const submissions = await submissionSchema.find({ assignmentId: req.params.assignmentId }, null, options);
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting submissions' });
  }
});

router.post('/:assignmentId/submissions', limiter, jwtMiddleware, async (req, res) => {
  try {
    const assignmentID = req.params.assignmentId;
    const studentID = req.user.id;
    const {file} = req.body;
    const assignment = await AssignmentSchema.findById(assignmentID);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    const submission = new submissionSchema({
      assignmentID,
      studentID,
      file,
      timestamp: new Date()
    });
    submission.save().then(() => {
      const submissionURL = `http://localhost:8000/submissions/${submission.id}/download`;
      res.status(201).json({
        id: submission.id,
        studentID: submission.studentId,
        assignmentID: submission.assignmentId,
        timestamp: submission.timestamp,
        file: submissionURL
      });
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      error: 'Error creating submission'
    });
  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating submissions' });
  }
});

router.get('/:assignmentId/submissions/:submissionId', limiter, jwtMiddleware, async (req, res) => {
  try {
    const submission = await submissionSchema.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    const filepath = submission.file;
    res.download(filepath);
    res.status(200).json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting submission' });
  }
});
  
