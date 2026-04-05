import API from "../api";

export const getUserProfile = async () => {
    return await API.get("/users/profile");
};

export const updateUserProfile = async (data) => {
    return await API.put("/users/profile", data);
};

export const changePassword = async (data) => {
    return await API.put("/users/change-password", data);
};

export const uploadProfileImage = async (formData) => {
    return await API.post("/users/profile-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
