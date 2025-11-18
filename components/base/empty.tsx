import React from "react";

const Empty = ({message}: {message: string}) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <img
        src="/images/empty.png"
        alt="Empty"
        className="max-w-[200px] w-full h-auto aspect-square object-cover"
      />
      <p className="text-[#A1A1A1] text-[20px]">{message}</p>
    </div>
  );
};

export default Empty;
