import API from "../api";

export const addSubService2 = (data) =>
  API.post("/sub-services2", data);

export const getAllSubService2 = () =>
  API.get("/sub-services2/getall");

export const getSubService2ByServiceId = (serviceId) =>
  API.get(`/sub-services2/service/${serviceId}`);

export const getSubService2ById = (id) =>
  API.get(`/sub-services2/${id}`);

export const updateSubService2 = (id, data) =>
  API.put(`/sub-services2/${id}`, data);

export const deleteSubService2 = (id) =>
  API.delete(`/sub-services2/${id}`);
