import axios from 'axios';

const api = axios.create({
  baseURL: 'https://jsd-dotdoc-back.onrender.com/api',
});

export default api;
