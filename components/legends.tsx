import { AsteriskIcon, ChevronsUp } from "lucide-react";
import React from "react";

export function ModifiedLegend() {
  return (
    <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-full text-xs">
      <AsteriskIcon size={16} />
    </span>
  );
}

export function BoostedLegend() {
  return (
    <span className="bg-lime-600 border border-lime-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
      <ChevronsUp size={16} />
    </span>
  );
}
