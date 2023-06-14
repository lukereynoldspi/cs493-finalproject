const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true }
});


const CourseSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  term: { type: String, required: true },
  instructorId: { type: Number, required: true },
  enrolledStudents: [],
  assignments: { type: Array, required: true },
  page: { type: String, required: true },
  courseId: { type: Number, required: true }
});
const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;