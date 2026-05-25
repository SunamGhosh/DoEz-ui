import API from "../api";

export const onboardAsProvider = async (data) => {
  return await API.post("/provider/onboard", data);
};

export const getProviderProfile = async () => {
  return await API.get("/provider/profile");
};

export const updateProviderProfile = async (data) => {
  return await API.put("/provider/profile", data);
};

export const toggleAvailability = async (status, coords) => {
  const payload = { status };
  if (coords && coords.lat != null && coords.lng != null) {
    payload.lat = coords.lat;
    payload.lng = coords.lng;
  }
  return await API.put("/provider/availability", payload);
};

export const getProviderEarnings = async () => {
  return await API.get("/provider/earnings");
};

export const uploadKycDocuments = async (formData) => {
  return await API.post("/provider/upload-kyc", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const submitFullKyc = async (formData) => {
  return await API.post("/provider/submit-kyc", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadPaymentQr = async (formData) => {
  return await API.post("/provider/upload-payment-qr", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getProviderBookings = async () => {
  return await API.get("/booking/provider");
};

export const updateBookingStatus = async (id, status) => {
  return await API.put(`/booking/${id}/update`, { status });
};

export const getProviderReviews = async (id) => {
  return await API.get(`/reviews/provider/${id}`);
};

// only for admins
export const getAllProviders = async () => {
  return await API.get("/provider/all");
};

// admin
export const addProvider = (data) =>
  API.post("/provider/admin", data);

export const updateProvider = (id, data) =>
  API.put(`/provider/admin/${id}`, data);

export const deleteProvider = (id) =>
  API.delete(`/provider/admin/${id}`);

export const approveProviderKyc = (id, status) =>
  API.put(`/provider/admin/${id}/kyc`, { status });

// Update provider services
export const updateProviderServices = async (data) => {
  return await API.put("/provider/services", data);
};

// Get providers by service/sub-service (with optional location-based filtering)
export const getProvidersByService = async (subService3Id, coords) => {
  const params = {};
  if (coords && coords.lat != null && coords.lng != null) {
    params.lat = coords.lat;
    params.lng = coords.lng;
  }
  return await API.get(`/provider/by-service/${subService3Id}`, { params });
};

