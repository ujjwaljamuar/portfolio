import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN_AUTH_KEY } from "../services/apiClient";
import {
    deleteBlog,
    getAdminBlogs,
    updateBlogStatus,
} from "../services/blogService";
import { formatDate, normalizeBlogList } from "../utils/blog";

const AdminBlogs = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadBlogs = async () => {
        setLoading(true);
        try {
            const result = await getAdminBlogs();
            setBlogs(normalizeBlogList(result));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBlogs();
    }, []);

    const logout = () => {
        localStorage.removeItem(ADMIN_AUTH_KEY);
        navigate("/admin/login", { replace: true });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Delete this blog?");
        if (!confirmed) return;

        await deleteBlog(id);
        toast.success("Blog deleted");
        loadBlogs();
    };

    const handleStatus = async (id, status) => {
        await updateBlogStatus(id, status);
        toast.success(`Blog ${status}`);
        loadBlogs();
    };

    return (
        <main className="adminPage">
            <header className="adminHeader">
                <div>
                    <p>Admin</p>
                    <h1>Blog Dashboard</h1>
                </div>
                <div>
                    <Link to="/admin/blogs/new">New Blog</Link>
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            <section className="adminPanel">
                {loading ? (
                    <p className="stateText">Loading blogs...</p>
                ) : blogs.length === 0 ? (
                    <p className="stateText">No blogs found.</p>
                ) : (
                    <div className="adminTableWrap">
                        <table className="adminTable">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map((blog) => (
                                    <tr key={blog._id}>
                                        <td>{blog.title}</td>
                                        <td><span data-status={blog.status}>{blog.status}</span></td>
                                        <td>{formatDate(blog.updatedAt)}</td>
                                        <td>
                                            <div className="adminActions">
                                                <Link to={`/admin/blogs/edit/${blog._id}`}>Edit</Link>
                                                <button onClick={() => handleDelete(blog._id)}>Delete</button>
                                                {blog.status === "published" ? (
                                                    <button onClick={() => handleStatus(blog._id, "hidden")}>Hide</button>
                                                ) : (
                                                    <button onClick={() => handleStatus(blog._id, "published")}>Publish</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminBlogs;
