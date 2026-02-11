import API from "../api";

// Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
  return await API.post("/payments/verify", paymentData);
};
