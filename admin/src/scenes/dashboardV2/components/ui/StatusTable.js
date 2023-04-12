import StatusText from "../../moderator-ref/subscenes/sejour/components/StatusText";
import React from "react";

export default function StatusTable({ statuses, className = "" }) {
  console.log("statuses: ", statuses);
  const columns = statuses
    ? {
        left: statuses.slice(0, Math.ceil(statuses.length / 2)),
        right: statuses.slice(Math.ceil(statuses.length / 2)),
      }
    : {
        left: [],
        right: [],
      };

  return (
    <div className={`flex ${className}`}>
      <div className="flex flex-col w-[45%] gap-2">
        {columns.left.map((column) => (
          <StatusText status={column.status} nb={column.nb} percentage={column.percentage} key={column.status} />
        ))}
      </div>
      <div className="flex w-[10%] justify-center items-center">
        <div className="w-[1px] h-3/5 border-r-[1px] border-gray-300"></div>
      </div>
      <div className="flex flex-col w-[45%] gap-1">
        {columns.right.map((column) => (
          <StatusText status={column.status} nb={column.nb} percentage={column.percentage} key={column.status} />
        ))}
      </div>
    </div>
  );
}