import React from "react";

interface Props {
  file: string | File | undefined;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  title: string;
}

const ShowFile = ({ file, title }: Props) => {
  const baseUrl = process.env.NEXT_PUBLIC_API;

  if (!file || typeof file !== "string") return null;

  const src = `${baseUrl}/uploads/${encodeURIComponent(file)}`;

  return (
    <div className="w-[full] h-[600px] px-4">
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
