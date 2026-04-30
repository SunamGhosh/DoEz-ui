import API from "../api";

export const getMessagesByBookingId = async (bookingId) => {
  return await API.get(`/chat/${bookingId}/messages`);
};

export const getBookingMessages = getMessagesByBookingId;
