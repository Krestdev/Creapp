import React from "react";
import { Button } from "./ui/button";
import { ArrowBigLeft } from "lucide-react";

// needs parameters to update content with respect to page
// needs button colors
// needs fonts to be set
const PageTitle = () => {
  // setting background color to "bg-gradient-to-r from-[#9E1349] to-[#700032]
  return (
    <div className="bg-gradient-to-r from-[#9E1351] to-[#700032] rounded-[12px] px-[24px] py-[20px] gap-4 flex flex-col text-white">
      <div className="flex justify-between">
        <div>
          <h1 className="font-bold">Besoins</h1>
          <h4>Consulter et gerez les besoins</h4>
        </div>
        <Button>
          <ArrowBigLeft size={20} />
          Precedent
        </Button>
      </div>
      <div className="flex gap-3">
        <Button>Creer un Besoin</Button>
        <Button>Voir mes Besoins</Button>
      </div>
    </div>
  );
};

export default PageTitle;
