import cors from "cors";
import axios from "axios";
import express from "express";
import { randomBytes } from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const commentsByPostId = {};

app.get(`/posts/:id/comments`, (req, res) => {
    const postId = req.params.id;
    res.json({ comments: commentsByPostId[postId] || [] });
});

app.post(`/posts/:id/comments/create`, async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
        return res.status(422).json({ message: "Content must be a non-empty string." });
    }

    const commentId = randomBytes(4).toString("hex");
    const comments = commentsByPostId[postId] || [];

    const commentData = { id: commentId, content, status: "pending" };
    comments.push(commentData);
    commentsByPostId[postId] = comments;
    try {
        await axios.post(`http://event-bus-srv:8080/events`, {
            type: "COMMENT_CREATED",
            data: {
                postId,
                ...commentData,
            },
        });
    } catch (error) {
        console.error(`[ERROR] Failed to emit COMMENT_CREATED event: ${error}`);
    }

    res.status(201).json({ comments });
});


app.post(`/events`, async (req, res) => {
    const { type, data } = req.body
    switch (type) {
        case "COMMENT_MODERATED": {
            const { postId, id, status } = data;
            const comments = commentsByPostId[postId] || [];
            const comment = comments?.find((item) => item?.id === id);
            if (comment) {
                comment.status = status;
                try {
                    await axios.post(`http://event-bus-srv:8080/events`, {
                        type: "COMMENT_UPDATED",
                        data: {
                            ...data,
                        }
                    });
                } catch (error) {
                    console.error(`[ERROR] Failed to emit COMMENT_UPDATED event: ${error}`);
                }
            } else {
                console.error(`[ERROR] Comment with id ${id} not found`)
            }
            break;
        }

        default: {
            console.warn(`[WARN] Unhandled event type: ${type}`);
            break;
        }
    }
    res.json({ status: 'OK' });
});

app.listen(8002, () => {
    console.log(`Comments service listening on port 8002`)
});