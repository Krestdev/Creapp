"use client";
import { useState } from "react";

export function useFilters() {
  const [filters, setFilters] = useState({
    pageIndex: 0,
    pageSize: 30
  });
  return {
    filters,
    setFilters,
  };
}
