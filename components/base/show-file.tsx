import { ArrowLeft } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface Props {
  file: string | File | undefined;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  title: string;
}

const ShowFile = ({ file, title, setPage }: Props) => {
  const baseUrl = process.env.NEXT_PUBLIC_API;

  if (!file || typeof file !== "string") return null;

  const src = `${baseUrl}/${encodeURIComponent(file)}`;

  return (
    <div className="w-[full] h-[600px] px-4 flex-1 overflow-auto pb-6 flex flex-col gap-2">
      <Button
        className="w-fit shrink-0 fixed "
        variant="ghost"
        onClick={() => setPage(1)}
      >
        <ArrowLeft />
        {"Retour"}
      </Button>
      <img
        src={src}
        alt={title}
        className="h-full w-auto aspect-auto object-contain"
        onError={() => console.error("Image non chargée :", src)}
      />
    </div>
  );
};

export default ShowFile;
