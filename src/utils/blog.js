export const emptyBlogForm = {
    title: "",
    slug: "",
    summary: "",
    tags: "",
    coverImage: "",
    status: "draft",
    content: "",
};

export const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateValue));
};

export const normalizeBlogList = (blogs) => {
    if (Array.isArray(blogs)) return blogs;
    if (Array.isArray(blogs?.data)) return blogs.data;
    if (Array.isArray(blogs?.blogs)) return blogs.blogs;
    return [];
};

export const tagsToText = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");

export const textToTags = (tags) =>
    tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

export const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
