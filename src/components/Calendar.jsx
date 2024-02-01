import React, { useEffect, useRef, useState } from "react";
import chevronRight from "../assets/icons/right-chevron.png";
import chevronLeft from "../assets/icons/left-chevron.png";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import DayCell from "./DayCell";
const Calendar = () => {
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [currentCells, setCurrentCells] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [mousePressed, setMousePressed] = useState(false);
  const [datesHovered, setDatesHovered] = useState();
  const [range, setRange] = useState({});
  const daysWrapper = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:3010/api/v1/accommodations")
      .then((res) => setDates(res.data.accommodations[1].dates));
  }, []);

  useEffect(() => {
    if (dates.length > 0) {
      setDefaultDate(new Date(dates[0].date));
    }
  }, [dates]);
  useEffect(() => {
    defaultDate && setCurrentMonth(defaultDate.getMonth());
    defaultDate && setCurrentYear(defaultDate.getFullYear());
  }, [defaultDate]);
  useEffect(() => {
    if (currentMonth != null) {
      findMonthToDisplay();
      currentMonth;
    }
  }, [currentMonth]);

  useEffect(() => {
    const handleDateClick = (event) => {
      const clickedDate = event.target.getAttribute("data-date");
      if (clickedDate) {
        const clickedDateObject = new Date(clickedDate);
        if (!range.startDate && !range.endDate) {
          setRange({ startDate: clickedDateObject, endDate: null });
          event.target.classList.add("range-selected");
        } else if (range.startDate && !range.endDate) {
          if (clickedDateObject > range.startDate) {
            setRange({
              startDate: range.startDate,
              endDate: clickedDateObject,
            });
            event.target.classList.add("range-selected");
          } else {
            setRange({ startDate: clickedDateObject, endDate: null });
          }
        } else {
          setRange({ startDate: clickedDateObject, endDate: null });
        }
      }
    };
    if (daysWrapper.current) {
      daysWrapper.current.addEventListener("click", handleDateClick);
    }
    return () => {
      if (daysWrapper.current) {
        daysWrapper.current.removeEventListener("click", handleDateClick);
      }
    };
  }, [range.startDate, range.endDate]);
  /*  useEffect(() => {
    const handleMouseHover = (event) => {
      //if startDate exists and mouse hover dates having date later than startDate add class "mouseHoverDate"
    };
    if (daysWrapper.current) {
      daysWrapper.current.addEventListener("mouseover", handleMouseHover);
    }
    return () => {
      if (daysWrapper.current) {
        daysWrapper.current.removeEventListener("click", handleDateClick);
      }
    };
  }, []); */
  const handleMouseOver = (event) => {
    const targetDate = event.target.getAttribute("data-date");
    if (targetDate) {
      const cellIndex = Array.from(daysWrapper.current.childNodes).indexOf(
        event.target
      );
      setHoveredDate(new Date(targetDate));

      // Remove "highlighted" class from all date cells
      Array.from(daysWrapper.current.childNodes).forEach((dateCell) => {
        dateCell.classList.remove("highlighted");
      });

      // Add a class to dates between startDate and hovered date
      const startDateIndex = Array.from(
        daysWrapper.current.childNodes
      ).findIndex(
        (node) =>
          node.getAttribute("data-date") === range.startDate.toISOString()
      );

      if (startDateIndex !== -1) {
        for (let i = 0; i < daysWrapper.current.childNodes.length; i++) {
          const dateCell = daysWrapper.current.childNodes[i];
          if (
            i >= Math.min(startDateIndex, cellIndex) &&
            i <= Math.max(startDateIndex, cellIndex)
          ) {
            dateCell.classList.add("highlighted");
          }
        }
      }
    }
  };

  const handleMouseOut = () => {
    setHoveredDate(null);
  };
  const findMonthToDisplay = () => {
    const fullMonth = [];
    const monthFirstDay = new Date(currentYear, currentMonth, 1);

    const monthFirstDayCopy = new Date(monthFirstDay);

    // Generate the full month
    while (monthFirstDayCopy.getMonth() === currentMonth) {
      fullMonth.push(new Date(monthFirstDayCopy));
      monthFirstDayCopy.setDate(monthFirstDayCopy.getDate() + 1);
    }

    // Create an array with dates containing ones from the `dates` array
    const datesArray = fullMonth.map((date) => {
      const foundDate = dates.find((selectedDate) => {
        const selectedDateObject = new Date(selectedDate.date);

        return (
          date.getMonth() === selectedDateObject.getMonth() &&
          date.getFullYear() === selectedDateObject.getFullYear() &&
          date.getDate() === selectedDateObject.getDate()
        );
      });
      return foundDate ? foundDate : { date: date, rate: null }; // Add a default rate if not found
    });
    const firstDayCell =
      new Date(datesArray[0].date).getDay() !== 0
        ? new Date(datesArray[0].date).getDay()
        : 7;

    const lastDatePrevMonth = new Date(monthFirstDay.setDate(0));
    const daysPrevMonth = lastDatePrevMonth.getDate();
    let countPrevMonthStart = daysPrevMonth - firstDayCell + 2;
    console.log(firstDayCell);
    const dayCells = [];
    for (let i = 1; i < firstDayCell; i++) {
      dayCells.push(
        <DayCell
          rate={null}
          dayNumber={countPrevMonthStart}
          isDisabled={true}
          date={null}
        />
      );
      countPrevMonthStart += 1;
    }

    for (let i = 1; i < datesArray.length + 1; i++) {
      dayCells.push(
        <DayCell
          rate={datesArray[i - 1].rate}
          dayNumber={new Date(datesArray[i - 1].date).getDate()}
          isDisabled={false}
          date={datesArray[i - 1].date}
        />
      );
    }
    const cellsMissing = 42 - datesArray.length - (firstDayCell - 1);

    let count = 0;
    for (let i = 0; i < cellsMissing; i++) {
      count += 1;
      dayCells.push(
        <DayCell rate={null} dayNumber={count} isDisabled={true} date={null} />
      );
    }
    setCurrentCells(dayCells);
  };

  return (
    <div className="calendar-wrapper">
      <div>
        <div className="calendar-header">
          <div className="range-first-day">
            <input type="text" value={"jan 29, 2024"} readOnly={true} />
          </div>
          <div className="range-last-day">
            <input readOnly={true} type="text" value={"jan 31, 2024"} />
          </div>
        </div>
        <div className="month">
          <img
            src={chevronLeft}
            alt=""
            className="left-arrow"
            onClick={() => {
              setCurrentMonth(currentMonth == 0 ? 11 : currentMonth - 1);
              currentMonth == 0 && setCurrentYear(currentYear - 1);
            }}
          />

          <div className="month-title">
            {currentMonth !== null &&
              format(new Date(currentYear, currentMonth, 1), "LLLL", {
                locale: fr,
              })}{" "}
            {currentYear}
          </div>

          <img
            src={chevronRight}
            alt=""
            className="right-arrow"
            onClick={() => {
              setCurrentMonth(currentMonth == 11 ? 0 : currentMonth + 1),
                currentMonth == 11 && setCurrentYear(currentYear + 1);
            }}
          />
        </div>
        <div className="calendar">
          <div className="week-days">
            <div className="monday">lun.</div>
            <div className="thuesday">mar.</div>
            <div className="wednesday">mer.</div>
            <div className="thursday">jeu.</div>
            <div className="friday">ven.</div>
            <div className="saturday">sam.</div>
            <div className="sunday">dim.</div>
          </div>
          <div
            className="days-wrapper"
            onMouseOver={(e) => range.endDate == null && handleMouseOver(e)}
            ref={daysWrapper}
          >
            {currentCells}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
