import API from "../api";

export const addSubService1 = (data) =>
  API.post("/sub-services1", data); 

export const getAllSubService1 = () =>
  API.get("/sub-services1/getall"); 

export const updateSubService1 = (id, data) =>
  API.put(`/sub-services1/${id}`, data);

export const deleteSubService1 = (id) =>
  API.delete(`/sub-services1/${id}`);
