import API from "../api";

// Get customer's bookings
export const getCustomerBookings = async () => {
  return await API.get("/booking/customer");
};

// Cancel a booking
export const cancelBooking = async (id) => {
  return await API.put(`/booking/${id}/cancel`);
};

// Create a new booking
export const createBooking = async (bookingData) => {
  return await API.post("/booking", bookingData);
};

// Delete a booking
export const deleteBooking = async (id) => {
  return await API.delete(`/booking/${id}`);
};

// Get last known provider location for a booking (used when customer opens tracking)
export const getProviderLocation = async (bookingId) => {
  return await API.get(`/booking/${bookingId}/provider-location`);
};
