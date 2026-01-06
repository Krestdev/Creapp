// lib/axios.ts
import axios from "axios";
import { toast } from "sonner";

const baseURL =
  process.env.NEXT_PUBLIC_API || "https://creappapi.krestdev.com/api/v1.0.0";

interface ApiError {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

const api = axios.create({
  baseURL,
  // timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fonction pour formater les messages d'erreur
const formatErrorMessage = (error: any): string => {
  if (error.response?.data) {
    const apiError = error.response.data as ApiError;
    
    if (apiError.errors) {
      // Erreurs de validation
      const validationErrors = Object.entries(apiError.errors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('\n');
      return validationErrors;
    }
    
    return apiError.message || apiError.error || "Une erreur est survenue";
  }
  
  if (error.code === 'ECONNABORTED') {
    return "La requête a expiré. Veuillez réessayer.";
  }
  
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return "Erreur réseau. Vérifiez votre connexion internet.";
  }
  
  return "Une erreur inattendue est survenue";
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("creapp") || "{}")?.state?.token
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const errorMessage = formatErrorMessage(error);
    toast.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Response Interceptor pour gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = formatErrorMessage(error);
    
    // Gestion des codes d'erreur spécifiques
    switch (error.response?.status) {
      case 401:
        // Rediriger vers login si token expiré
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("creapp");
          window.location.href = "/login";
        }
        toast.error("Session expirée. Veuillez vous reconnecter.");
        break;
        
      case 403:
        toast.error("Accès refusé. Vous n'avez pas les permissions nécessaires.");
        break;
        
      case 404:
        toast.error("Ressource non trouvée.");
        break;
        
      case 413:
        toast.error("Fichier trop volumineux. Taille maximale: 10MB");
        break;
        
      case 422:
        toast.error(`Erreur de validation:\n${errorMessage}`);
        break;
        
      case 429:
        toast.error("Trop de requêtes. Veuillez patienter.");
        break;
        
      case 500:
        toast.error("Erreur serveur. Veuillez réessayer plus tard.");
        break;
        
      default:
        toast.error(errorMessage);
    }
    
    // Vous pouvez aussi logger les erreurs
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorMessage,
      });
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;