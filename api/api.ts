import axios, { AxiosRequestConfig } from "axios";

const axiosConfig = (headers?: AxiosRequestConfig["headers"]) => {
  //const { logout } = useStore();
  const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API,
    headers: headers,
  });

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          //logout(); I need to set the local or session storage to remove the user saved
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
