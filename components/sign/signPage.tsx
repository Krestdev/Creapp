"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { useStore } from "@/providers/datastore";

const SignPage = () => {
  const { user } = useStore();

  return (
    <div>
      <p>Sign Page</p>
    </div>
  );
};

export default SignPage;
