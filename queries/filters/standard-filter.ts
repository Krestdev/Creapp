"use client";
import { useState } from "react";

export function useFilters() {
  const [filters, setFilters] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  return {
    filters,
    setFilters,
  };
}
