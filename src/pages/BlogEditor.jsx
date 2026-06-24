import MDEditor from "@uiw/react-md-editor";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiUploadCloud } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createBlog,
  getAdminBlogs,
  uploadBlogImage,
  updateBlog,
} from "../services/blogService";
import {
  emptyBlogForm,
  normalizeBlogList,
  slugify,
  tagsToText,
  textToTags,
} from "../utils/blog";

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyBlogForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const title = useMemo(() => (isEdit ? "Edit Blog" : "New Blog"), [isEdit]);

  useEffect(() => {
    if (!isEdit) return;

    const loadBlog = async () => {
      try {
        const result = await getAdminBlogs();
        const blog = normalizeBlogList(result).find((item) => item._id === id);

        if (!blog) {
          toast.error("Blog not found");
          navigate("/admin/blogs", { replace: true });
          return;
        }

        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          summary: blog.summary || "",
          tags: tagsToText(blog.tags),
          coverImage: blog.coverImage || "",
          status: blog.status || "draft",
          content: blog.content || "",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, isEdit, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "title" && !isEdit ? { slug: slugify(value) } : {}),
    }));
  };

  const uploadCoverImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploadingImage(true);

    try {
      const url = await uploadBlogImage(file);

      if (!url) {
        toast.error("Upload succeeded, but no image URL was returned");
        return;
      }

      updateField("coverImage", url);
      toast.success("Cover image uploaded");
    } catch {
      // API errors are displayed by the shared response interceptor.
    } finally {
      setUploadingImage(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (uploadingImage) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      summary: form.summary.trim(),
      tags: textToTags(form.tags),
      coverImage: form.coverImage.trim() || undefined,
      status: form.status,
      content: form.content,
    };

    try {
      if (isEdit) {
        await updateBlog(id, payload);
        toast.success("Blog updated");
      } else {
        await createBlog(payload);
        toast.success("Blog created");
      }

      navigate("/admin/blogs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="adminPage">
        <p className="stateText">Loading editor...</p>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <p>Admin</p>
          <h1>{title}</h1>
        </div>
        <Link to="/admin/blogs">Dashboard</Link>
      </header>

      <form className="editorForm" onSubmit={submitHandler}>
        <section className="editorFields">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
            />
          </label>
          <label>
            Summary
            <textarea
              value={form.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              required
            />
          </label>
          <label>
            Tags
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="react, node, dsa"
            />
          </label>
          <div className="formField coverImageField">
            <span>Cover Image URL</span>
            <div className="coverImageControls">
              <input
                aria-label="Cover Image URL"
                value={form.coverImage}
                onChange={(e) => updateField("coverImage", e.target.value)}
              />
              <label
                className={`imageUploadButton ${uploadingImage ? "disableBtn" : ""}`}
              >
                <FiUploadCloud />
                <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadCoverImage}
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {form.coverImage && (
              <img
                className="coverImagePreview"
                src={form.coverImage}
                alt="Cover preview"
              />
            )}
          </div>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </section>

        <section className="markdownEditor" data-color-mode="light">
          <MDEditor
            value={form.content}
            onChange={(value) => updateField("content", value || "")}
            height={520}
            preview="live"
          />
        </section>

        <div className="editorActions">
          <Link to="/admin/blogs">Cancel</Link>
          <button
            disabled={saving || uploadingImage}
            className={saving || uploadingImage ? "disableBtn" : ""}
          >
            {saving ? "Saving..." : "Save Blog"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default BlogEditor;
