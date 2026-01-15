import API from "../api";

export const addSubService3 = (data) =>
  API.post("/sub-services3", data);

export const getAllSubService3 = () =>
  API.get("/sub-services3/getall");

export const getSubService3ByServiceId = (serviceId) =>
  API.get(`/sub-services3/service/${serviceId}`);

export const getSubService3ById = (id) =>
  API.get(`/sub-services3/${id}`);

export const updateSubService3 = (id, data) =>
  API.put(`/sub-services3/${id}`, data);

export const deleteSubService3 = (id) =>
  API.delete(`/sub-services3/${id}`);

