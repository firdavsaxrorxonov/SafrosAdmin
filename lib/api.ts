import axios from "axios";

const api = axios.create({
  baseURL: "https://horeca.felixits.uz/api/v1/admin",
});

export default api;
