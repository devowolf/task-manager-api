const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: "Mike",
    password: "mike@1122",
    email: "mike@example.com",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwo = {
    _id: userTwoId,
    name: "Jess",
    password: "jess@1122",
    email: "jess@example.com",
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};


const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "First Task",
    completed: false,
    owner: userOneId
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Second Task",
    completed: true,
    owner: userOneId
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Third Task",
    completed: false,
    owner: userTwoId
};

const setupDatabase = async () => {
    // Delete existing data
    await User.deleteMany();
    await Task.deleteMany();

    // Insert dummy data to work with
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    taskTwoId: taskTwo._id,
    setupDatabase,
};