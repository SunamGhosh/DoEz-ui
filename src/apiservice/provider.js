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

export const toggleAvailability = async (status) => {
  return await API.put("/provider/availability", { status });
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

export const getProviderBookings = async () => {
  return await API.get("/booking/provider");
};

export const updateBookingStatus = async (id, status) => {
  return await API.put(`/booking/${id}/update`, { status });
};

export const getProviderReviews = async (id) => {
  return await API.get(`/reviews/provider/${id}`);
};
