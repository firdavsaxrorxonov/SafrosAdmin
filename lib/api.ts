import axios from "axios";

const api = axios.create({
  baseURL: "https://safros.uz/api/v1/admin",
});

export default api;
