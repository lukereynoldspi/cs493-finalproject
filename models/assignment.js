const mongoose = require('mongoose');
const AssignmentSchema = new mongoose.Schema({
  courseId: { type: Number, required: true },
  assignmentId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  title: { type: String, required: true },
  points: { type: Number, required: true },
  due: { type: String, required: true },
  timestamp: { type: Date, required: true },
  studentSubmissions: { type: Array, required: true }
});
const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;