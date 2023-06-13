require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const api = require('./api')
// const { connectToDb } = require('./lib/mongo')
const dbOptions ={
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const port = 8000

const dbURL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cw6yjly.mongodb.net/${process.env.MONGO_DB_NAME}`;
mongoose.connect(dbURL, dbOptions).then(() => {
  console.log('Connected to MongoDB Tarpaulin database');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});
/*
 * Morgan is a popular logger.
 */
const app = express()
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

app.use('*', function (err, req, res, next) {
  console.error("== Error:", err)
  res.status(500).send({
      err: "Server error.  Please try again later."
  })
})

app.listen(port, function() {
  console.log("== Server is running on port", port);
});

