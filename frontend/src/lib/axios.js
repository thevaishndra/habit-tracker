import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5173/api',
    withCredentials: true,
})
//our base url that we will use to make requests to the backend, instead of everywhere in the code we can change the base url in one place and it will work everywhere