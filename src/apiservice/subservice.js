import API from "../api";

export const addSubService = (data) => API.post("/sub-services", data);
export const getSubServices = () => API.get("/sub-services/getall");
export const updateSubService = (id, data) => API.put(`/sub-services/${id}`, data);
export const deleteSubService = (id) => API.delete(`/sub-services/${id}`);
