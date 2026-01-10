"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { userQ } from "@/queries/baseModule";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const safeName =
    name.length <= 2 ? `${name[0] ?? ""}*` : `${name.slice(0, 2)}***`;
  const [d1, ...rest] = domain.split(".");
  const safeDomain = d1 ? `${d1[0]}***` : "***";
  return `${safeName}@${safeDomain}.${rest.join(".") || ""}`.replace(/\.$/, "");
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userQuery = React.useMemo(() => userQ, []);

  const emailFromUrl = searchParams.get("email") ?? "";
  const otpFromUrl = searchParams.get("otp") ?? "";

  const [otp, setOtp] = React.useState(
    otpFromUrl.replace(/\D/g, "").slice(0, 6)
  );

  const canSubmit = emailFromUrl.includes("@") && otp.length === 6;

  const verifyMutation = useMutation({
    mutationFn: async ({ otp, email }: { otp: number; email: string }) =>
      userQuery.getVerificationOtp(otp, email),
    onSuccess: (data) => {
      toast.success(`Votre adresse email a été vérifiée ✅`);
      router.push("/connexion");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(
        `Échec de la vérification : ${error?.message ?? "Erreur inconnue"}`
      );
      console.error(error);
    },
  });

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    verifyMutation.mutate({ otp: Number(otp), email: emailFromUrl });
  };

  // auto-submit si OTP complet
  React.useEffect(() => {
    if (!canSubmit || verifyMutation.isPending) return;
    verifyMutation.mutate({ otp: Number(otp), email: emailFromUrl });
  }, [canSubmit]);

  const invalidLink = !emailFromUrl;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{"Vérification de votre adresse email"}</CardTitle>
          <CardDescription>
            {invalidLink ? (
              <span className="text-destructive">
                {
                  "Le lien est incomplet. Ouvrez le lien reçu par email ou saisissez le code manuellement."
                }
              </span>
            ) : (
              <>
                {"Nous avons envoyé un code de vérification à "}
                <span className="font-medium">{maskEmail(emailFromUrl)}</span>.
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>{"Email"}</Label>
              <Input value={emailFromUrl} disabled />
            </div>

            <div className="grid gap-2">
              <Label>{"Code OTP (6 chiffres)"}</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(v) => setOtp(v.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!canSubmit || verifyMutation.isPending}
              isLoading={verifyMutation.isPending}
            >
              {"Vérifier"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/connexion")}
            >
              {"Retour connexion"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
