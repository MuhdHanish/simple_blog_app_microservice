import cors from "cors";
import axios from "axios";
import express from "express";
import { randomBytes } from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const posts = {};

app.get(`/posts`, (req, res) => {
    res.json({ posts });
});

app.post(`/posts/create`, async (req, res) => {
    const { title } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(422).json({ message: "Title must be a non-empty string." });
    }

    const id = randomBytes(4).toString("hex");
    posts[id] = { id, title };

    try {
        await axios.post(`http://event-bus-srv:8080/events`, {
            type: "POST_CREATED",
            data: { id, title },
        });
    } catch (error) {
        console.error(`[ERROR] Failed to emit POST_CREATED event: ${error.message}`);
    }

    res.status(201).json({ id });
});

app.post(`/events`, (req, res) => {
    console.log(`[INFO] Received Event: ${req.body.type}`);
    res.sendStatus(200);
});

app.listen(8001, () => {
    console.log(`Posts service listening on port 8001`)
});