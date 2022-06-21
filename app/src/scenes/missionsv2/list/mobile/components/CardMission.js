import React from "react";
import { Link } from "react-router-dom";
import { translateApplication, translate } from "../../../../../utils";
import DomainThumb from "../../../../../components/DomainThumb";
import LocationMarker from "../../../../../assets/icons/LocationMarker";
import EyeOff from "../../../../../assets/icons/EyeOff";
import Eye from "../../../../../assets/icons/Eye";
import Check from "../../../../../assets/icons/Check";
import SixDotsVertical from "../../../../../assets/icons/SixDotsVertical";
import { Draggable } from "react-beautiful-dnd";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";

export default function mission({ mission }) {
  const tags = [];
  mission.city && tags.push(mission.city + (mission.zip ? ` - ${mission.zip}` : ""));
  mission.domains.forEach((d) => tags.push(translate(d)));

  return (
    <Link to={`/mission/${mission._id}`} className="bg-white relative flex  justify-between shadow-nina rounded-xl p-3 border-[1px] border-[#ffffff] mb-4 z-10">
      <div className="flex flex-1">
        {/* icon */}
        <div className="flex items-center">
          <DomainThumb domain={mission?.domain} size="3rem" />
        </div>

        {/* infos mission */}
        <div className="flex flex-col flex-1">
          <div className="space-y-2">
            <div className="flex space-x-4">
              <div className="text-gray-500 text-xs uppercase font-medium">{mission?.structureName}</div>
            </div>
            <div className="text-gray-900 font-bold text-base">{mission?.name}</div>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-1 items-center justify-start">
              <div className="text-gray-500 text-xs font-normal">
                Places disponibles:&nbsp;{mission?.placesLeft}/{mission?.placesTotal}
              </div>
            </div>
            {mission?.sort?.length ? (
              <div className="flex items-center justify-end space-x-2">
                <LocationMarker className="text-gray-400" />
                <div className="text-gray-800 text-xs font-bold">à {Math.round((mission?.sort || [])[0])} km</div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
