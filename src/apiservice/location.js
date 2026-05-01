import API from "../api";

export const addCountry = async (data) => await API.post("/locations/countries", data);
export const updateCountry = async (id, data) => await API.put(`/locations/countries/${id}`, data);
export const getAllCountries = async () => await API.get("/locations/countries");
export const getCountryById = async (id) => await API.get(`/locations/countries/${id}`);

export const addState = async (data) => await API.post("/locations/states", data);
export const updateState = async (id, data) => await API.put(`/locations/states/${id}`, data);
export const getAllStates = async () => await API.get("/locations/states");
export const getStateById = async (id) => await API.get(`/locations/states/${id}`);
export const getStatesByCountryId = async (countryId) => await API.get(`/locations/states/country/${countryId}`);

export const addCity = async (data) => await API.post("/locations/cities", data);
export const updateCity = async (id, data) => await API.put(`/locations/cities/${id}`, data);
export const getAllCities = async () => await API.get("/locations/cities");
export const getCityById = async (id) => await API.get(`/locations/cities/${id}`);
export const getCitiesByStateId = async (stateId) => await API.get(`/locations/cities/state/${stateId}`);

export const addPincode = async (data) => await API.post("/locations/pincodes", data);
export const updatePincode = async (id, data) => await API.put(`/locations/pincodes/${id}`, data);
export const getAllPincodes = async () => await API.get("/locations/pincodes");
export const getPincodeById = async (id) => await API.get(`/locations/pincodes/${id}`);
export const getPincodesByCityId = async (cityId) => await API.get(`/locations/pincodes/city/${cityId}`);