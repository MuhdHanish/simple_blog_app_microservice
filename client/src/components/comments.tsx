import axios from "axios";
import { FormEvent, useCallback, useState } from "react";

export const Comments = ({
    postId,
    prevComments,
}: {
    prevComments: any[];
    postId: string;
}) => {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<any[]>([...prevComments]);
    const [comment, setComment] = useState("");
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!comment) return;
        try {
            setLoading(true);
            await axios.post(`http://node-microservices-tutorial-basic-project.com/posts/${postId}/comments/create`, {
                content: comment
            });
            fetchComments();
            setComment("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`http://node-microservices-tutorial-basic-project.com/posts/${postId}/comments`);
            setComments(Object.values(response?.data?.comments) || []);
        } catch (error) {
            console.error(error);
        }
    }, []);
    return (
        <>
            <ul>
                {
                    comments?.map((comment, index) => (
                        <li
                            className="text-muted"
                            style={{ fontStyle: comment?.status !== 'approved' ? 'italic' : '' }}
                            key={`${comment?.id}-${index}`}
                        >
                            {(() => {
                                switch (comment?.status) {
                                    case 'pending':
                                        return 'This comment is awaiting mederation.';

                                    case 'rejected':
                                        return 'This comment has been rejected.';

                                    default:
                                        return comment?.content;
                                }
                            })()}
                        </li>
                    ))
                }
            </ul>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div className="form-group" >
                    <label htmlFor="comment">New Comment</label>
                    <input value={comment} onChange={(e) => setComment(e.target.value)} type="text" className="form-control" id="comment" placeholder="Enter comment" />
                </div>
                <button disabled={loading} type="submit" className="btn btn-primary">
                    {loading ? "Submittng..." : "Submit"}
                </button>
            </form>
        </>
    )
}