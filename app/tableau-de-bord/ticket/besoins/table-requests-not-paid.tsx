"use client";
import { PaymentRequest, RequestModelT, User } from "@/types/types";
import React from "react";

interface Props {
  requests: Array<RequestModelT>;
  tickets: Array<PaymentRequest>;
  users: Array<User>;
}

function NotPaidRequestsTable({ requests, tickets, users }: Props) {
  return <div>NotPaidRequestsTable</div>;
}

export default NotPaidRequestsTable;
