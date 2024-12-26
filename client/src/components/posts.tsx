import axios from "axios";
import { FormEvent, useCallback, useEffect, useState } from "react"
import { Comments } from "./comments";

export const Posts = () => {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [title, setTitle] = useState("");
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title) return;
        try {
            setLoading(true);
            await axios.post(`http://node-microservices-tutorial-basic-project.com/posts/create`, {
                title
            });
            fetchPosts();
            setTitle("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchPosts = useCallback(async () => {
        try {
            const response = await axios.get(`http://node-microservices-tutorial-basic-project.com/posts`);
            setPosts(Object.values(response?.data?.posts) || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, []);
    return (
        <>
            <h1>Create Post</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div className="form-group" >
                    <label htmlFor="title">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="form-control" id="title" placeholder="Enter title" />
                </div>
                <button disabled={loading} type="submit" className="btn btn-primary">
                    {loading ? "Submittng..." : "Submit"}
                </button>
            </form>
            <hr />
            <h1 style={{ marginBottom: 10 }}>Posts</h1>
            <div className="d-flex flex-row flex-wrap gap-4">
                {
                    posts?.map((post, index) => (
                        <div className="card col-12 col-lg-4" style={{ marginBottom: "20px" }} key={`${post?.id}-${index}`}>
                            <div className="card-body">
                                <h3>{post?.title}</h3>
                                <Comments prevComments={post?.comments} postId={post?.id} />
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}
