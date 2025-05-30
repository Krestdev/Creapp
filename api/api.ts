import axios, { AxiosRequestConfig } from "axios";

const axiosConfig = (headers?: AxiosRequestConfig['headers']) => {
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    headers: headers,
  });

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.log('Non autorisé');
        }
      } else {
        console.error("Erreur inconnue :", error);
      }
      throw error;
    }
  );

  return axiosClient;
};

export default axiosConfig;
