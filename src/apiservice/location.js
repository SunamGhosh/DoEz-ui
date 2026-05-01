import API from "../api";

// ======================
// COUNTRY APIs
// Backend Route:
// /api/country/countries
// ======================
export const addCountry = async (data) =>
    await API.post("/country/countries", data);

export const updateCountry = async (id, data) =>
    await API.put(`/country/countries/${id}`, data);

export const getAllCountries = async () =>
    await API.get("/country/countries");

export const getCountryById = async (id) =>
    await API.get(`/country/countries/${id}`);


// ======================
// STATE APIs
// Example route:
// /api/state/states
// ======================
export const addState = async (data) =>
    await API.post("/state/states", data);

export const updateState = async (id, data) =>
    await API.put(`/state/states/${id}`, data);

export const getAllStates = async () =>
    await API.get("/state/states");

export const getStateById = async (id) =>
    await API.get(`/state/states/${id}`);

export const getStatesByCountryId = async (countryId) =>
    await API.get(`/state/states/country/${countryId}`);


// ======================
// CITY APIs
// Example route:
// /api/city/cities
// ======================
export const addCity = async (data) =>
    await API.post("/city/cities", data);

export const updateCity = async (id, data) =>
    await API.put(`/city/cities/${id}`, data);

export const getAllCities = async () =>
    await API.get("/city/cities");

export const getCityById = async (id) =>
    await API.get(`/city/cities/${id}`);

export const getCitiesByStateId = async (stateId) =>
    await API.get(`/city/cities/state/${stateId}`);

export const deleteCountry = async (id) =>
    await API.delete(`/country/countries/${id}`);

export const deleteState = async (id) =>
    await API.delete(`/state/states/${id}`);

export const deleteCity = async (id) =>
    await API.delete(`/city/cities/${id}`);