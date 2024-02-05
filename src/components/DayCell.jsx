import React from "react";

const DayCell = ({ date, rate, available, className }) => {
  const newDate = new Date(date);
  const dayNumber = newDate.getDate();
  return (
    <div
      tabIndex={!available ? -1 : 0}
      key={date}
      className={`day${` ${className}`}`}
      data-date={date}
    >
      <div className="day-number">{dayNumber}</div>
      {rate && <div className="rate">{rate}€</div>}
    </div>
  );
};

export default DayCell;
