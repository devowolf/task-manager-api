const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const auth = require("../middleware/auth");
const User = require("../models/user");
const router = new express.Router();

// Create an instance for multer to use with /users/me/avatar POST route
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if( !file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
            return cb(new Error("Please upload a JPG,JPEG or PNG image."));
        }

        cb(undefined, true);
    }
});

// Error Handling function for routes, to send json back as opposed to html
const errorHandler = (err, req, res, next) => {
    res.status(400).send({ error: err });
}

// Routes
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []; // Wipe the tokens array
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save()
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);


        if (!user || !user.avatar) {
            throw new Error("Image not found");
        }

        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send(e.message);
    }
})

router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every( update => allowedUpdates.includes(update) );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates" });
    }

    try {

        updates.forEach( (update) => req.user[update] = req.body[update] );
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send()
    }
    
});

module.exports = router;