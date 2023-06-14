const express = require('express');
const router = express.Router();
const CourseSchema = require('../models/course');
const userSchema = require('../models/user');
const jwtMiddleware = require('../jwtMiddleware');
// const csv = require('csv-parser');
const fs = require('fs');
exports.router = router;
router.get('/', jwtMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const options = {
    skip: (page - 1) * limit,
    limit: parseInt(limit)
  };
  try {
    const courses = await CourseSchema.find({},'enrolledStudents -assignments', options);
    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting courses' });
  }
});

router.get('/:courseId', jwtMiddleware, async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const course = await CourseSchema.findById( courseId, 'enrolledStudents -assignments');
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

router.get('/:courseId/roster', jwtMiddleware, async (req, res) => {
  try {
    const courseID = req.params.courseId;
    const course = await CourseSchema.findById(courseID);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const students = course.enrolledStudents;
    const filename = `course_${courseID}_roster.csv`;
    const filepath = `./rosters/${filename}`;
    const writestream = fs.createWriteStream(filepath);
    writestream.write('"Student ID", "Name", "Email"\n');
    for (const studentID of students) {
      const student = await userSchema.findById(studentID);
      writestream.write(`"${studentID}", "${student.name}", "${student.email}"\n`);
    }
    writestream.end();
    writestream.on('finish', () => {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      const filestream = fs.createReadStream(filepath);
      filestream.pipe(res);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting roster' });
  }
});