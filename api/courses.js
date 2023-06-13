const express = require('express');
const router = express.Router();
const CourseSchema = require('../models/course');
const jwtMiddleware = require('../jwtMiddleware');

router.get('/', jwtMiddleware, async (req, res) => {
  try {
    const courses = await CourseSchema.find();
    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting courses' });
  }
});

router.get('/:courseId', jwtMiddleware, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const course = await CourseSchema.findById( req.params.courseId );
    res.status(200).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting course' });
  }
});

router.post('/', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const courseData = req.body;
  const newCourse = new CourseSchema(courseData);
  newCourse.save().then(() => {
    res.status(201).json({ id: newCourse.id });
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      error: 'Error creating course'
    });
  });
});

router.patch('/:courseId', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin' || req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const courseId = req.params.courseId;
  const courseData = req.body;
  try {
    const course = await CourseSchema.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    course.set(courseData);
    await course.save();
    res.status(200).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating course' });
  }
});

router.delete('/:courseId', jwtMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const courseId = req.params.courseId;
  try {
    const course = await CourseSchema.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    await course.remove();
    res.status(204).json();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting course' });
  }
});

router.get('/:courseID/students', jwtMiddleware, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const course = await CourseSchema.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.status(200).json(course.enrolledStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting students' });
  }
});

router.post('/:courseId/students', jwtMiddleware, async (req, res) => {
  const courseId = req.params.courseId;
  const studentId = req.body.studentId;
  try {
    const course = await CourseSchema.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    course.enrolledStudents.push(studentId);
    await course.save();
    res.status(200).json(course.enrolledStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding student' });
  }
});