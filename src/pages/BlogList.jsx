import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../services/blogService";
import { formatDate, normalizeBlogList } from "../utils/blog";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const tags = useMemo(
    () =>
      [
        ...new Set(blogs.flatMap((blog) => blog.tags || []).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b)),
    [blogs],
  );
  const filteredBlogs =
    selectedTags.length === 0
      ? blogs
      : blogs.filter((blog) =>
          selectedTags.some((tag) => (blog.tags || []).includes(tag)),
        );

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

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

      {!loading && !error && blogs.length > 0 && (
        <>
          <div className="blogTagFilters">
            <button
              className="blogTagFilterToggle"
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="blogTagFilterOptions"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <span>Filter by tag</span>
              <strong>
                {selectedTags.length === 0
                  ? "All tags"
                  : `${selectedTags.length} selected`}
              </strong>
              <span className="blogTagFilterChevron" aria-hidden="true">
                {filtersOpen ? "−" : "+"}
              </span>
            </button>
            {filtersOpen && (
              <nav
                className="blogTagFilterOptions"
                id="blogTagFilterOptions"
                aria-label="Filter blogs by tag"
              >
                {tags.map((tag) => (
                  <button
                    className={selectedTags.includes(tag) ? "active" : ""}
                    type="button"
                    key={tag}
                    aria-pressed={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    <span className="blogTagCheck" aria-hidden="true">
                      {selectedTags.includes(tag) ? "✓" : ""}
                    </span>
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button
                    className="blogTagClear"
                    type="button"
                    onClick={() => setSelectedTags([])}
                  >
                    Clear filters
                  </button>
                )}
              </nav>
            )}
          </div>
          {filteredBlogs.length === 0 ? (
            <p className="stateText">No blogs found for the selected tags.</p>
          ) : (
            <section className="blogGrid">
              {filteredBlogs.map((blog) => (
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
          )}
        </>
      )}
    </main>
  );
};

export default BlogList;
