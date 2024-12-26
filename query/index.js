import cors from "cors";
import axios from "axios";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

const posts = {};

app.get(`/posts`, (req, res) => {
    res.json({ posts });
});

const handleEvent = (type, data) => {
    switch (type) {
        case "POST_CREATED": {
            const { id, title } = data;
            posts[id] = { id, title, comments: [] };
            break;
        }

        case "COMMENT_CREATED": {
            const { postId, ...rest } = data;
            const post = posts[postId];
            if (post) {
                post?.comments?.push({ ...rest });
            } else {
                console.error(`[ERROR] Post with id ${postId} not found`);
            }
            break;
        }

        case "COMMENT_UPDATED": {
            const { postId, id, ...rest } = data;
            const post = posts[postId];
            if (post) {
                const comments = post?.comments || [];
                const commentIndex = comments?.findIndex((item) => item?.id === id);
                if (commentIndex !== -1) {
                    comments[commentIndex] = { id, ...rest };
                } else {
                    console.error(`[ERROR] Comment with id ${id} not found`);
                }
            } else {
                console.error(`[ERROR] Post with id ${postId} not found`);
            }
            break;
        }

        default: {
            console.warn(`[WARN] Unhandled event type: ${type}`);
            break;
        }
    }
};

app.post(`/events`, (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.json({ status: 'OK' });
});

app.listen(8003, async () => {
    console.log(`Query service listening on port 8003`);
    try {
        const response = await axios.get(`http://event-bus-srv:8080/events`);
        const data = response?.data?.events || [];
        data.forEach((event) => {
            console.log(`[INFO] Processing event: ${event?.type}`);
            handleEvent(event?.type, event?.data);
        });
    } catch (error) {
        console.error(`[ERROR] Could not fetch events: ${error}`);
    }
});