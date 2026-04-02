"use client";
import PageTitle from "@/components/pageTitle";
import { userQ } from "@/queries/baseModule";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PenLine, UploadCloud, Trash2, Save } from "lucide-react";
import FilesUpload from "@/components/comp-547";

function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const updateSignature = useMutation({
    mutationFn: async (signature: File) => {
      return await userQ.createSignature(signature);
    },
    onSuccess: () => {
      toast.success("Votre signature a été enregistrée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  // Adjust Canvas sizing on mount and resize
  useEffect(() => {
    if (activeTab === "draw") {
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#0f172a"; // slate-900
          }
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, [activeTab]);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      setUploadedFile(null);
    }
  };

  const handleSave = () => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // We assume it's not completely blank, but could add pixel analysis
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "signature.png", { type: "image/png" });
          updateSignature.mutate(file);
        }
      }, "image/png");
    } else {
      if (uploadedFile) {
        updateSignature.mutate(uploadedFile);
      } else {
        toast.error("Veuillez d'abord importer une image");
      }
    }
  };

  return (
    <div className="content">
      <PageTitle
        title="Signature"
        subtitle="Configurez votre signature électronique"
        color="blue"
      />

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-max">
        <button
          onClick={() => setActiveTab("draw")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "draw"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <PenLine className="size-4" />
          Dessiner
        </button>
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "upload"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <UploadCloud className="size-4" />
          Importer une image
        </button>
      </div>

      <div className="max-w-3xl w-full bg-white border rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === "draw"
              ? "Dessinez votre signature"
              : "Importez votre signature"}
          </h2>
          <p className="text-sm text-gray-500">
            {activeTab === "draw"
              ? "Utilisez le cadre ci-dessous pour dessiner votre signature."
              : "Glissez ou sélectionnez une image de votre signature."}
          </p>
        </div>

        {activeTab === "draw" && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 w-full relative touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="cursor-crosshair block w-full touch-none"
            />
          </div>
        )}

        {activeTab === "upload" && (
          <FilesUpload
            value={uploadedFile}
            onChange={(v) => setUploadedFile((v?.[0] || null) as File | null)}
            name={"signature"}
            maxFiles={1}
          />
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClear} type="button">
            <Trash2 className="size-4 mr-2" />
            Effacer
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={updateSignature.isPending}
            disabled={updateSignature.isPending}
          >
            <Save className="size-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
