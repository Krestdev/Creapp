import React from "react";

interface StatsCardProps {
  title: string;
  titleColor: string,
  value: string | number;
  description: string;
  descriptionValue: string;
  className: string;
  descriptionColor: string;
  dvalueColor: string;
  dividerColor: string;
}

const StatsCard = (props: StatsCardProps) => {
  return (
    <div
      className={`w-full flex flex-col gap-2 p-5 rounded-[12px] shadow-[0px_8px_6px_-6px_rgba(0,0,0,0.1)] border ${props.className}`}
    >
      <p className={`text-sm font-medium ${props.titleColor}`}>{props.title}</p>
      <p className="text-[32px] font-medium">{props.value}</p>
      <div className={`h-px w-full ${props.dividerColor}`} />
      <p className={`text-[12px] ${props.descriptionColor} `}>{props.description} <span className={`font-medium ${props.dvalueColor}`}>{props.descriptionValue}</span> </p>
    </div>
  );
};

export default StatsCard;
