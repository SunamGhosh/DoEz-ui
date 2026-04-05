import API from "../api";

export const submitReview = async (data) => {
    const res = await API.post("/reviews", data);
    return res.data;   
};


export const getProviderReviews = async (id) => {
    const res = await API.get(`/reviews/provider/${id}`);
    return res.data;   
};


export const getAllReviews = async () => {
    return await API.get("/reviews/all");
};
