const mongoose = require('mongoose');
const AssignmentSchema = new mongoose.Schema({
  courseId: { type: Number, required: true },
  title: { type: String, required: true },
  points: { type: Number, required: true },
  due: { type: String, required: true },
  studentSubmissions: { type: Array, required: true }
});
const Assignment = mongoose.model('Assignment', AssignmentSchema);
module.exports = Assignment;