const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const { userOne, userOneId, userTwo, taskTwoId, setupDatabase } = require("./fixtures/db");


beforeEach(setupDatabase);


test("Should create a new task for user", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({ description: "Clean the room" })
        .expect(201);
    
    // Assert that the task is saved to db
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test("Get tasks for a user", async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toBe(2);
});


test("delete tasks of another user", async () => {
    await request(app)
        .delete(`/tasks/${taskTwoId}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    // Assert if the task still exists in db
    const task = await Task.findById(taskTwoId);
    expect(task).not.toBeNull();

});