import React, { useState } from "react";

const DayCell = ({ date, rate, available, className }) => {
  const newDate = new Date(date);
  const dayNumber = newDate.getDate();
  return (
    <div
      onClick={() => console.log("test")}
      key={date}
      className={`day${` ${className}`}`}
    >
      <div className="day-number">{dayNumber}</div>
      {rate && <div className="rate">{rate}€</div>}
    </div>
  );
};

export default DayCell;
