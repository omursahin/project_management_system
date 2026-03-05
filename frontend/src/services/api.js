import axios from 'axios';

// Az önce .env dosyasına gizlediğimiz o adresi buradan çağırıyoruz!
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;