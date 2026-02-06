"use client";
import { useEffect, useState } from "react";

const DateTimeDisplay = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  // Format time as 12-hour format (e.g., 12:23 PM)
  const time = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Format day (e.g., Thursday)
  const weekday = dateTime.toLocaleDateString("en-US", { weekday: "long" });

  // Format date (e.g., 24 October, 2025)
  const date = dateTime.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col ">
      <h2 className="text-[16px] dark:text-white font-medium text-[#3A3A3A] text-right">
        {time}
      </h2>
      <p className="text-[12px] hidden lg:inline text-[#979797] mt-1">
        {weekday}, {date}
      </p>
    </div>
  );
};

export default DateTimeDisplay;
