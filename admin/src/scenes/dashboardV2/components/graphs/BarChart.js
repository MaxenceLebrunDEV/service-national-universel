import React, { useEffect, useState } from "react";
import { graphColors } from "./graph-commons";

export default function BarChart({ values, title, noValue = false, unit = "", className = "" }) {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    if (values && values.length > 0) {
      const colors = graphColors[values.length];
      const maxValue = Math.max(...values);
      setBars(
        values.map((value, idx) => {
          return {
            color: colors[idx],
            height: Math.min(Math.round((value / maxValue) * 100), 100) + "%",
            value: value + (unit ? unit : ""),
          };
        }),
      );
    } else {
      setBars([]);
    }
  }, [values]);

  return (
    <div className={` ${className}`}>
      <div className="flex flex-col items-center h-[100%]">
        <div className="flex flex-grow-1">
          {bars.map((bar, idx) => (
            <div className="flex flex-col items-center mr-[6px] last:mr-0" key={"bar-" + idx}>
              <div className="flex-grow-1 relative w-[16px]">
                <div className="absolute left-[0px] right-[0px] bottom-[0px] rounded-full" style={{ height: bar.height, backgroundColor: bar.color }}></div>
              </div>
              {!noValue && bar.value !== null && bar.value !== undefined && <div className="">{bar.value}</div>}
            </div>
          ))}
        </div>
        {title && <div className="text-gray-900 text-sm font-bold mt-[10px]">{title}</div>}
      </div>
    </div>
  );
}