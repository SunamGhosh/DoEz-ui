import API from "../api";

export const submitReview = async (data) => {
    return await API.post("/reviews", data);
};

export const getProviderReviews = async (id) => {
    return await API.get(`/reviews/provider/${id}`);
};

export const getAllReviews = async () => {
    return await API.get("/reviews/all");
};
