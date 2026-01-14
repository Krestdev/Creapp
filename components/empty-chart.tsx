import { ChartSplineIcon } from "lucide-react";
import React from "react";

interface Props {
    description?: string;
}

function EmptyChart({description="Aucune donnée à afficher"}:Props) {
  return (
    <div className="w-full h-full flex flex-col py-7 gap-2 items-center justify-center text-center text-gray-600">
      <span className="flex items-center justify-center size-10 rounded-full bg-gray-100">
        <ChartSplineIcon size={20} className="text-gray-400" />
      </span>
      <span>{description}</span>
    </div>
  );
}

export default EmptyChart;
