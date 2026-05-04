import API from "../api";

export const getAdminStats = async () => {
    return await API.get("/admin/commissions");
};

export const getAllUsers = async () => {
    return await API.get("/users");
};

export const getAllBookings = async () => {
    return await API.get("/booking");
};

export const getAllReviews = async () => {
    return await API.get("/reviews/all");
};

export const deleteUser = async (id) => {
    return await API.delete(`/users/${id}`);
};

export const updateAdmin = async (id, data) => {
    return await API.put(`/admin/admins/${id}`, data);
};

export const createAdmin = async (data) => {
    return await API.post("/admin/admins", data);
};

export const updateUserStatus = async (id, status) => {
    return await API.patch(`/users/status/${id}`, { status });
};
