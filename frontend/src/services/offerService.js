import api from "./api";

export const getOffers = async () => {
    const response = await api.get("/special-offers");
    return response.data;
};

export const getActiveOffers = async () => {
    const response = await api.get("/special-offers/active");
    return response.data;
};