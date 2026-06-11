import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../services/blogService";
import { formatDate, normalizeBlogList } from "../utils/blog";

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const result = await getBlogs();
                setBlogs(normalizeBlogList(result));
            } catch (err) {
                setError("Unable to load blogs right now.");
            } finally {
                setLoading(false);
            }
        };

        loadBlogs();
    }, []);

    return (
        <main className="blogPage">
            <section className="blogHero">
                <p>Knowledge Base</p>
                <h1>Blogs</h1>
                <span>Notes, builds, and ideas from my developer journey.</span>
            </section>

            {loading && <p className="stateText">Loading blogs...</p>}
            {error && <p className="stateText">{error}</p>}
            {!loading && !error && blogs.length === 0 && (
                <p className="stateText">No published blogs yet.</p>
            )}

            <section className="blogGrid">
                {blogs.map((blog) => (
                    <article className="blogCard" key={blog._id || blog.slug}>
                        <div className="blogCardImage">
                            {blog.coverImage ? (
                                <img src={blog.coverImage} alt={blog.title} />
                            ) : (
                                <span>{blog.title?.charAt(0) || "B"}</span>
                            )}
                        </div>
                        <div className="blogCardContent">
                            <p>{formatDate(blog.createdAt)}</p>
                            <h2>{blog.title}</h2>
                            <span>{blog.summary}</span>
                            <div className="tagRow">
                                {(blog.tags || []).map((tag) => (
                                    <small key={tag}>{tag}</small>
                                ))}
                            </div>
                            <Link to={`/blogs/${blog.slug}`}>Read More</Link>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
};

export default BlogList;
