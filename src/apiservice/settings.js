import API from "../api";

export const getSettings = async () => {
    return await API.get("/settings");
};

export const updateSettings = async (data) => {
    return await API.put("/settings", data);
};

export const updateSetting = async (key, value) => {
    return await API.patch(`/settings/${key}`, { value });
};

export const uploadLogo = async (formData) => {
    return await API.post("/settings/upload-logo", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
