const mongoose = require('mongoose')
const submissionSchema = new mongoose.Schema({
  assignmentId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  grade: { type: String, required: true },
  timestamp: { type: String, required: true },
  file: { type: String, required: true }
});
const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;