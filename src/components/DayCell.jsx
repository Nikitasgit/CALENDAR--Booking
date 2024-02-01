import React from "react";

const DayCell = ({ dayNumber, isDisabled, date, rate }) => {
  return (
    <div
      key={date}
      className={`day ${isDisabled ? "disabled-day" : ""}`}
      data-date={date}
    >
      {dayNumber}
      {rate !== null && <div className="rate">{rate}€</div>}
    </div>
  );
};

export default DayCell;
