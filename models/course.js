const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  term: { type: String, required: true },
  instructorId: { type: Number, required: true },
  enrolledStudents: { type: Number, required: true },
  assignments: { type: Array, required: true },
  page: { type: String, required: true },
  courseid: { type: Number, required: true }
});
const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;