"use client";

import Empty from "@/components/base/empty";
import { BesoinsTraiter } from "@/components/besoin/besoin-traiter";
import { Category, RequestModelT } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface Props {
  selected: Request[];
  setSelected: Dispatch<SetStateAction<Request[]>>;
  requests: Array<RequestModelT>;
  categories: Array<Category>;
  isHome?: boolean;
}

const Besoins = ({
  selected,
  setSelected,
  requests,
  categories,
  isHome = false,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {requests.length > 0 ? (
        <div className="flex flex-col">
          <BesoinsTraiter
            data={requests}
            selected={selected}
            setSelected={setSelected}
            categories={categories}
            isHome={isHome}
          />
        </div>
      ) : (
        <Empty message={"Aucune donnée à afficher"} />
      )}
    </div>
  );
};

export default Besoins;
