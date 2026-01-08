"use client";

import { DataTable } from "@/components/base/data-table";
import { RequestModelT } from "@/types/types";

interface RequestListProps {
  data: Array<RequestModelT>;
}

const RequestList = ({ data }: RequestListProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <DataTable data={data} />
      </div>
    </div>
  );
};

export default RequestList;
