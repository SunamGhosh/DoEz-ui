import API from "../api";

export const getNotifications = async () => {
    return await API.get("/notifications");
};

export const getUnreadCount = async () => {
    return await API.get("/notifications/unread-count");
};

export const markAsRead = async (id) => {
    return await API.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    return await API.put("/notifications/mark-all-read");
};

export const deleteNotification = async (id) => {
    return await API.delete(`/notifications/${id}`);
};
