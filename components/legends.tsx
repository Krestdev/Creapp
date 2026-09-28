import { AsteriskIcon, ChevronsUp, Clock } from "lucide-react";
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

export function UncashedCheckLegend() {
  return (
    <span className="bg-orange-600 border border-orange-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
      <Clock size={14} />
    </span>
  );
}
