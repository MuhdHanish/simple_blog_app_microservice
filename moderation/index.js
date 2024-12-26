import axios from "axios";
import express from "express";

const app = express();

app.use(express.json());

app.post(`/events`, async (req, res) => {
    const { type, data } = req.body;

    if (!type || !data) {
        console.error(`[ERROR] Invalid event format: ${JSON.stringify(req.body)}`);
        return res.status(400).json({ message: "Invalid event format" });
    }

    switch (type) {
        case "COMMENT_CREATED": {
            const prohibitedWords = ["stupid", "idiot", "dumb", "fool", "nonsense", "moron"];
            const content = data?.content?.toLowerCase();
            const status = prohibitedWords.some((word) => content?.includes(word)) ? "rejected" : "approved";
            try {
                await axios.post(`http://event-bus-srv:8080/events`, {
                    type: "COMMENT_MODERATED",
                    data: {
                        ...data,
                        status,
                    },
                });
            } catch (error) {
                console.error(`[ERROR] Failed to emit COMMENT_MODERATED event: ${error}`);
            }
            break;
        }
        default: {
            console.warn(`[WARN] Unhandled event type: ${type}`);
        }
    }

    res.json({ status: "OK" });
});


app.listen(8004, () => {
    console.log(`Moderation service listening on port 8004`)
});