const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDatabase } = require("./fixtures/db");


beforeEach(setupDatabase);


test("Should signup a new user", async () => {
    const response =  await request(app).post("/users").send({
        name: "Sahil Saini",
        email: "hello@sahilsaini.com",
        password: "passWWhhdi@@1",
    }).expect(201);

    // Assert the db was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: user.name,
            email: user.email,
        },
        token: user.tokens[0].token,
    });

    // assert that the password is hashed
    expect(user.password).not.toBe("passWWhhdi@@1");
});

test("Should login existing user", async () => {

    const response = await request(app)
        .post("/users/login")
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    // Assert that the user token is saved to the database
    const user = await User.findById(userOneId);
    expect(user).not.toBeNull();

    expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login non-existent user", async () => {
    await request(app).post("/users/login").send({
        email: "dummy@example.com",
        password: "dummypass101"
    }).expect(400);
});


test("Should get profile for authenticated user", async () => {
    await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test("Should not get profile for an unauthenticated user", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401);
});


test("Should delete account of user", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // Assert that the user is deleted
        const user = await User.findById(userOneId);
        expect(user).toBeNull();
});

test("Should not delete account when user not authenticated", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401);
});

test("Should upload avatar image to database", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .attach("avatar", "tests/fixtures/profile-pic.jpg")
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async() => {
    const updates = {
        name: "User1",
        email: "user1@example.com"
    };
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send(updates)
        .expect(200);

    // Assert that the user has been updated
    const user = await User.findById(userOneId);
    expect(user).not.toBeNull();
    expect(user).toMatchObject(updates);
});

test("Should not update invalid user details", async () => {
    await request(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({location: "Punjab"})
        .expect(400);
});