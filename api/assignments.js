const express = require('express');
const router = express.Router();
const AssignmentSchema = require('../models/assignment');
const submissionSchema = require('../models/submission');
const jwtMiddleware = require('../jwtMiddleware');
exports.router = router;

router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const assignments = await AssignmentSchema.find();
    res.status(200).json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting assignments' });
  }
});

router.get('/:assignmentId', jwtMiddleware, async (req, res) => {
  const assignmentId = req.params.assignmentId;
  try {
    const assignment = await AssignmentSchema.findById( req.params.assignmentId );
    res.status(200).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting assignment' });
  }
});

router.post('/', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' || req.user.role !== 'instructor') {
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

router.patch('/:assignmentId', jwtMiddleware, async (req, res) => {
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

router.delete('/:assignmentId', jwtMiddleware, async (req, res) => {
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

router.get('/:assignmentId/submissions', jwtMiddleware, async (req, res) => {
  try {
    const submissions = await submissionSchema.find({ assignmentId: req.params.assignmentId });
    res.status(200).json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting submissions' });
  }
});

router.post('/:assignmentId/submissions', jwtMiddleware, async (req, res) => {
  try {
    const submissionData = req.body;
    const newSubmission = new submissionSchema(submissionData);
    newSubmission.save().then(() => {
      res.status(201).json({ id: newSubmission.studentId });
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Error creating submission'
      });
    });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating submission' });
  }
});
