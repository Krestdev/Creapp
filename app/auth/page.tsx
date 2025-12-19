"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { formatToShortName } from "@/lib/utils";
import { UserQueries } from "@/queries/baseModule";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const safeName = name.length <= 2 ? `${name[0] ?? ""}*` : `${name.slice(0, 2)}***`;
  const [d1, ...rest] = domain.split(".");
  const safeDomain = d1 ? `${d1[0]}***` : "***";
  return `${safeName}@${safeDomain}.${rest.join(".") || ""}`.replace(/\.$/, "");
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userQuery = React.useMemo(() => new UserQueries(), []);

  const emailFromUrl = searchParams.get("email") ?? "";
  const otpFromUrl = searchParams.get("otp") ?? "";

  const [otp, setOtp] = React.useState(otpFromUrl);

  // Normalisation OTP (digits only)
  const otpDigits = React.useMemo(() => (otp || "").replace(/\D/g, "").slice(0, 6), [otp]);

  const canSubmit = React.useMemo(() => {
    console.log(`email: ${emailFromUrl} - otp: ${otpFromUrl}`)
    console.log(emailFromUrl.includes("@") && otpDigits.length === 6);
    return emailFromUrl.includes("@") && otpDigits.length === 6;
  }, [emailFromUrl, otpDigits]);

  const verifyMutation = useMutation({
    mutationFn: async ({ otp, email }: { otp: number; email: string }) =>
      userQuery.getVerificationOtp(otp, email),
    onSuccess: (data) => {
      toast.success(`${formatToShortName(data.data.name)}, votre adresse email a été vérifiée ✅`);
      // Redirection (adapte selon ton flow)
      router.push("/connexion"); // ou "/tableau-de-bord"
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(`Échec de la vérification : ${error?.message ?? "Erreur inconnue"}`);
    },
  });

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    verifyMutation.mutate({ otp: Number(otpDigits), email:emailFromUrl });
  };

  // ✅ Option: auto-submit si otp dans l'URL est complet
  React.useEffect(() => {
    if (emailFromUrl && otpDigits.length === 6 && !verifyMutation.isPending) {
      // évite re-trigger si mutation en cours
      verifyMutation.mutate({ otp: Number(otpDigits), email:emailFromUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // une seule fois au mount

  // Si pas d'email dans l'URL => page explicite
  const invalidLink = !emailFromUrl;

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{"Vérification de votre adresse email"}</CardTitle>
          <CardDescription>
            {invalidLink ? (
              <span className="text-destructive">
                {"Le lien est incomplet. Ouvrez le lien reçu par email ou saisissez le code manuellement."}
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
              <Input value={emailFromUrl || ""} disabled placeholder="email@exemple.com" />
            </div>

            <div className="grid gap-2">
              <Label>{"Code OTP (6 chiffres)"}</Label>
              <InputOTP 
              maxLength={6} 
              value={otpDigits} 
              onChange={(e) =>setOtp(e)}
              inputMode="numeric"
              autoComplete="one-time-code">
                <InputOTPGroup>
                    <InputOTPSlot index={0}/>
                    <InputOTPSlot index={1}/>
                    <InputOTPSlot index={2}/>
                    <InputOTPSlot index={3}/>
                    <InputOTPSlot index={4}/>
                    <InputOTPSlot index={5}/>
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-muted-foreground">
                {"Astuce : vous pouvez copier-coller le code reçu par email."}
              </p>
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

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                className="px-0"
                onClick={() => router.push("/connexion")}
              >
                {"Retour connexion"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
