import axios from "axios";

const API = axios.create({
    // baseURL: "http://127.0.0.1:8000/api/",
    baseURL: "http://192.168.1.54:8000/api/",
});

API.interceptors.request.use((config) => {
    const publicEndpoints = ["login/", "signup/", "logout/", "token/refresh/"];
    const requestPath = config.url?.replace(/^\/+/, "");
    if (publicEndpoints.includes(requestPath)) {
        return config;
    }

    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default API;