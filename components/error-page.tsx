import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  statusCode?: number;
  title?: string;
  message?: string;
}

function ErrorPage({
  error,
  resetErrorBoundary,
  statusCode = 500,
  title = "Quelque chose s'est mal passé",
  message = "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
}: ErrorProps) {
  // Messages d'erreur par statut
  const errorMessages: Record<number, { title: string; message: string }> = {
    404: {
      title: "Page non trouvée",
      message: "La page que vous recherchez n'existe pas ou a été déplacée.",
    },
    401: {
      title: "Non autorisé",
      message: "Vous devez être connecté pour accéder à cette page.",
    },
    403: {
      title: "Accès refusé",
      message:
        "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
    },
    500: {
      title: "Erreur serveur",
      message:
        "Le serveur a rencontré une erreur interne. Veuillez réessayer plus tard.",
    },
  };

  // Utiliser le message d'erreur spécifique au statut si disponible
  const errorInfo = errorMessages[statusCode] || { title, message };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Icône d'erreur */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Code d'erreur */}
        {statusCode && (
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-700">
            {statusCode}
          </div>
        )}

        {/* Titre et message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {errorInfo.message}
          </p>
        </div>

        {/* Détails de l'erreur (en développement) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
            <details className="cursor-pointer">
              <summary className="font-medium text-gray-700 dark:text-gray-300">
                {"Détails techniques"}
              </summary>
              <pre className="mt-2 text-sm text-gray-600 dark:text-gray-400 overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {resetErrorBoundary ? (
            <Button
              onClick={resetErrorBoundary}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              {"Réessayer"}
            </Button>
          ) : (
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              {"Recharger la page"}
            </Button>
          )}

          <Link href="/" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <Home />
              {"Retour à l'accueil"}
            </Button>
          </Link>
        </div>

        {/* Support technique */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {"Si le problème persiste, contactez le support technique."}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {`Référence : ${new Date().getTime().toString(36).toUpperCase()}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
