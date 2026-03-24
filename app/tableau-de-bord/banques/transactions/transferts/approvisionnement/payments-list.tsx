import { XAF } from "@/lib/utils";
import { PaymentRequest } from "@/types/types";
import React from "react";

interface Props {
  data: Array<PaymentRequest>;
  value: Array<number>;
}

function PaymentsList({ data, value }: Props) {
  return (
    <React.Fragment>
      {value.length === 0 ? (
        <span className="border-input flex min-h-10 w-full items-center gap-1.5 min-w-32 max-w-full rounded border bg-transparent px-4 py-1 text-sm text-muted-foreground cursor-pointer">
          {"Sélectionner des besoins"}
        </span>
      ) : (
        <span className="border-input flex flex-col min-h-10 gap-1.5 w-full min-w-32 max-w-full rounded border bg-transparent px-2 py-2 text-sm cursor-pointer">
          {value.map((v) => (
            <span
              key={v}
              className="flex gap-1.5 justify-between line-clamp-1 text-sm font-medium px-1.5 py-0.5 rounded bg-gray-50 border"
            >
              {data.find((i) => i.id === v)?.title}
              <p className="font-semibold shrink-0 text-primary-600">
                {XAF.format(data.find((i) => i.id === v)?.price ?? 0)}
              </p>
            </span>
          ))}
        </span>
      )}
    </React.Fragment>
  );
}

export default PaymentsList;
