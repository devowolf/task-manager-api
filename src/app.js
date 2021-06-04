const express = require("express");
const path = require("path");
require(path.join(__dirname, "/db/mongoose"));
const userRouter = require(path.join(__dirname, "/routers/user.js"));
const taskRouter = require(path.join(__dirname, "/routers/task.js"));

// Express config
const app = express();


app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;