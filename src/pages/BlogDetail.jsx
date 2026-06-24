import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getBlogBySlug } from "../services/blogService";
import { formatDate } from "../utils/blog";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const result = await getBlogBySlug(slug);
        setBlog(result);
      } catch (err) {
        setError("Unable to load this blog.");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <main className="blogPage">
        <p className="stateText">Loading blog...</p>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="blogPage">
        <p className="stateText">{error || "Blog not found."}</p>
        <Link className="textLink" to="/blogs">
          Back to blogs
        </Link>
      </main>
    );
  }

  return (
    <main className="blogDetailPage">
      <Link className="textLink" to="/blogs">
        Back to blogs
      </Link>
      <article>
        {blog.coverImage && (
          <img className="blogCover" src={blog.coverImage} alt={blog.title} />
        )}
        <div className="blogDetailHeader">
          <p>{formatDate(blog.createdAt)}</p>
          <h1>{blog.title}</h1>
          <span>{blog.summary}</span>
          <div className="tagRow">
            {(blog.tags || []).map((tag) => (
              <small key={tag}>{tag}</small>
            ))}
          </div>
        </div>
        <MarkdownRenderer content={blog.content} />
      </article>
    </main>
  );
};

export default BlogDetail;
