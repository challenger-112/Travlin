import axios from "axios";

const API = axios.create({
    // baseURL: "http://127.0.0.1:8000/api/",
    baseURL: "http://192.168.1.54:8000/api/",
});

export default API;