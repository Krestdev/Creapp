"use client";
import useAuthGuard from "@/hooks/useAuthGuard";
import Link from "next/link";
import { BrandPanel } from "./brand-panel";
import Login from "./login";

function Page() {
  useAuthGuard({ requireAuth: false });
  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-[2fr_3fr]">
      <BrandPanel className="hidden lg:flex" />

      <section className="flex min-h-dvh flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          {/* Le panneau de marque est masqué sous 1024 px : le logo prend le relais. */}
          <Link
            href="/connexion"
            className="rounded-sm outline-none focus-visible:shadow-focus-ring lg:invisible"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="CreApp" className="h-8 w-auto" />
          </Link>
          <a
            href="mailto:contact@krestdev.com"
            className="rounded-sm text-body-medium text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
          >
            {"Besoin d’aide ?"}
          </a>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 lg:pt-24">
          <div className="flex w-full max-w-110 flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-heading-1 text-text-primary">
                {"Connexion"}
              </h1>
              <p className="text-body-large text-text-secondary">
                {"Renseignez vos informations pour accéder à l’application."}
              </p>
            </div>

            <Login />

            <div className="flex flex-col gap-3 border-t border-border-default pt-5">
              <p className="text-caption text-text-tertiary">
                {"Pas encore de compte ? Les comptes sont créés par l’administrateur de votre organisation."}
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center text-caption text-text-tertiary">
          {"© 2026 CREAPP · Réalisé par "}
          <a
            href="https://krestdev.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm outline-none hover:underline focus-visible:shadow-focus-ring"
          >
            {"KrestDev"}
          </a>
        </footer>
      </section>
    </main>
  );
}

export default Page;
