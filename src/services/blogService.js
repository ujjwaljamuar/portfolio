import apiClient from "./apiClient";

const unwrap = (response) => {
    const payload = response.data;
    const data = payload?.data ?? payload;

    return data?.blog ?? data?.blogs ?? data;
};

export const getBlogs = async () => {
    const response = await apiClient.get("/blogs");
    return unwrap(response);
};

export const getBlogBySlug = async (slug) => {
    const response = await apiClient.get(`/blogs/${slug}`);
    return unwrap(response);
};

export const loginAdmin = async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return unwrap(response);
};

export const getAdminBlogs = async () => {
    const response = await apiClient.get("/blogs/admin");
    return unwrap(response);
};

export const createBlog = async (payload) => {
    const response = await apiClient.post("/blogs/admin/blog", payload);
    return unwrap(response);
};

export const updateBlog = async (id, payload) => {
    const response = await apiClient.put(`/blogs/admin/blog/${id}`, payload);
    return unwrap(response);
};

export const deleteBlog = async (id) => {
    const response = await apiClient.delete(`/blogs/admin/blog/${id}`);
    return unwrap(response);
};

export const updateBlogStatus = async (id, status) => {
    const response = await apiClient.patch(`/blogs/admin/blog/${id}/status`, {
        status,
    });
    
    return unwrap(response);
}