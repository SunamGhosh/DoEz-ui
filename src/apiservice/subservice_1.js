import API from "../api";

// Create subservice
export const addSubService1 = (data) =>
  API.post("/sub-services1", data); // matches backend

// Get all subservices
export const getAllSubService1 = () =>
  API.get("/sub-services1/getall"); // backend has /getall

// Update subservice
export const updateSubService1 = (id, data) =>
  API.put(`/sub-services1/${id}`, data);

// Delete subservice
export const deleteSubService1 = (id) =>
  API.delete(`/sub-services1/${id}`);
