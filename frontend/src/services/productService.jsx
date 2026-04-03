import axios from "axios";

export const getProductsByCategory = (category) =>
  axios.get(`http://localhost:5000/api/products/${category}`);
