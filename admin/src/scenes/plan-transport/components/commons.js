import React from "react";
import ArrowNarrowLeft from "../../../assets/icons/ArrowNarrowLeft";
import People from "../../../assets/icons/People";

export function Title({ children, className = "" }) {
  return <div className={`text-2xl font-bold text-[#242526] leading-7 ${className}`}>{children}</div>;
}

export function SubTitle({ children, className = "" }) {
  return <div className={`text-sm font-normal text-gray-800 leading-[14px] ${className}`}>{children}</div>;
}

export function MiniTitle({ children, className = "" }) {
  return <div className={`text-[14px] font-bold text-["#1F2937] leading-[20px] ${className}`}>{children}</div>;
}

export function Box({ children, className = "" }) {
  return (
    <div className={`bg-[#FFFFFF] rounded-[8px] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] text-[14px] leading-[20px] text-[#1F2937] px-[28px] py-[24px] relative ${className}`}>
      {children}
    </div>
  );
}

export function BoxHeader({ children, title, className = "" }) {
  return (
    <div className={`flex items-center justify-between pb-[24px] border-b-[##E5E7EB] border-b-[1px] ${className}`}>
      <div className="font-bold text-[23px] leading-[28px] text[#111827]">{title ? title : ""}</div>
      <div className="">{children}</div>
    </div>
  );
}

export function Loading({ width }) {
  return (
    <div className={`animate-pulse flex space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="h-2 bg-gray-300 rounded col-span-2"></div>
          <div className="h-2 bg-gray-300 rounded col-span-1"></div>
        </div>
      </div>
    </div>
  );
}

export const regionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

export function Badge({ children, mode = "blue", className = "" }) {
  let modeClass;

  switch (mode) {
    case "green":
      modeClass = "bg-[#E4F3EC] text-[#059669]";
      break;
    case "blue":
    default:
      modeClass = "bg-[#E8EDFF] text-[#0063CB]";
  }
  return <div className={`rounded-[4px] text-[12x] leading-[20px] px-[6px] py-[0px] whitespace-nowrap ${modeClass} ${className}`}>{children}</div>;
}

export function AlertPoint({ threshold, value, className = "" }) {
  if (value > threshold) {
    return null;
  } else {
    return <div className={`bg-[#F97316] w-[8px] h-[8px] rounded-[100px] mr-[5px] ${className}`} />;
  }
}

export function BigDigits({ children, className = "" }) {
  return <div className={`text-[24px] leading-[28px] text-[#171725] font-bold ${className}`}>{children}</div>;
}

export function GroupBox({ className = "", children }) {
  return <div className={`bg-[#F7F7F8] rounded-[8px] p-[16px] ${className}`}>{children}</div>;
}

export function GroupHeader({ className = "", children, onBack }) {
  return (
    <div className={`flex items-center pt-[7px] px-[10px] pb-[19px] text-[#242526] text-[20px] leading-[28px] font-bold ${className}`}>
      <div
        className="bg-[#E5E7EB] rounded-full w-[38px] h-[38px] text-[#374151] hover:bg-[#374151] hover:text-[#E5E7EB] cursor-pointer flex items-center justify-center mr-[11px]"
        onClick={onBack}>
        <ArrowNarrowLeft />
      </div>
      {children}
    </div>
  );
}

export function GroupSummary({ group, className = "" }) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`text-[11px] leading-[1.3em] font-medium text-[#FFFFFF] rounded-full px-[10px] py-[1px] ${group.centerId ? "bg-[#9CA3AF]" : "bg-[#0C4A6E]"}`}>
        {group.centerId ? "Affecté" : "En attente d'affectation"}
      </div>
      <div className="flex items-center">
        <People className="mx-[5px] text-[#9CA3AF]" />
        {group.youngsVolume}
      </div>
    </div>
  );
}