import axios from "axios";

const api = axios.create({
  baseURL: "http://91.218.246.233/api/v1/admin",
});

export default api;
