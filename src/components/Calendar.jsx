import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import DayCell from "./DayCell";
import chevronRight from "../assets/icons/right-chevron.png";
import chevronLeft from "../assets/icons/left-chevron.png";
import {
  findNextMonthDates,
  findPrevMonthDates,
  getMissingDates,
} from "../functions/DisplayMonth";

const Calendar = () => {
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [currentCells, setCurrentCells] = useState([]);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [range, setRange] = useState({});
  const daysWrapper = useRef(null);
  const [currentMonthDates, setCurrentMonthDates] = useState();
  const { earliestDate, latestDate } = findMinMaxDates(dates);
  const [previousAvailability, setPreviousAvailability] = useState(true);

  const checkLatestDate = () => {
    const currentDate = new Date(currentYear, currentMonth, 1);
    if (currentDate > latestDate) {
      return false;
    }
    return true;
  };
  const checkEarliestDate = () => {
    const currentDate = new Date(currentYear, currentMonth, 1);
    if (currentDate < earliestDate) {
      return false;
    }
    return true;
  };
  function findMinMaxDates(dateArray) {
    if (!dateArray || dateArray.length === 0) {
      return { earliestDate: null, latestDate: null };
    }

    let earliestDate = new Date(dateArray[0].date);
    let latestDate = new Date(dateArray[0].date);

    for (let i = 1; i < dateArray.length; i++) {
      const currentDate = new Date(dateArray[i].date);

      if (currentDate < earliestDate) {
        earliestDate = currentDate;
      }

      if (currentDate > latestDate) {
        latestDate = currentDate;
      }
    }

    return { earliestDate, latestDate };
  }
  useEffect(() => {
    const currentMonthDates = dates.filter((dateObj) => {
      const date = new Date(dateObj.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
    const prevMonthDates = findPrevMonthDates(currentYear, currentMonth);
    const missingDates = getMissingDates(
      currentMonthDates,
      currentYear,
      currentMonth
    );
    const monthDatesExisting = addClassesToDates(currentMonthDates);
    const nextMonthDates = findNextMonthDates(
      prevMonthDates.length,
      missingDates.length,
      monthDatesExisting.length,
      currentYear,
      currentMonth
    );

    setCurrentMonthDates([
      ...prevMonthDates,
      ...missingDates,
      ...monthDatesExisting,
      ...nextMonthDates,
    ]);
  }, [currentMonth]);

  useEffect(() => {
    axios.get("http://localhost:3010/api/v1/accommodations").then((res) => {
      setDefaultDate(new Date(res.data.accommodations[1].dates[0].date));
      setDates(res.data.accommodations[1].dates);
      setCurrentMonth(
        new Date(res.data.accommodations[1].dates[0].date).getMonth()
      );
      setCurrentYear(
        new Date(res.data.accommodations[1].dates[0].date).getFullYear()
      );
    });
  }, []);

  /* useEffect(() => {
    const handleDateClick = (event) => {
      const clickedDateElement = event.target.closest(".day");
      if (clickedDateElement) {
        const clickedDate = clickedDateElement.getAttribute("data-date");
        const clickedDateObject = new Date(clickedDate);

        if (!range.startDate && !range.endDate) {
          setRange({ startDate: clickedDateObject, endDate: null });
        } else if (range.startDate && !range.endDate) {
          if (clickedDateObject > range.startDate) {
            setRange({
              startDate: range.startDate,
              endDate: clickedDateObject,
            });
            setHighlightedCells(
              getDatesBetween(range.startDate, clickedDateObject)
            );
          } else {
            setHighlightedCells([]);
            setRange({
              startDate: clickedDateObject,
              endDate: null,
            });
          }
        } else {
          setRange({ startDate: clickedDateObject, endDate: null });
          setHighlightedCells([]);
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
  }, [range.startDate, range.endDate]); */

  useEffect(() => {
    const cellsArray = Array.from(daysWrapper.current.childNodes);
    cellsArray.forEach((dateCell) => {
      dateCell.classList.remove("highlighted", "first-date", "last-date");
    });

    highlightedCells.forEach((date, index) => {
      const dateCell = cellsArray.find(
        (cell) => cell.getAttribute("data-date") == date
      );

      if (dateCell) {
        dateCell.classList.add("highlighted");

        if (index === 0) {
          dateCell.classList.add("first-date");
        }

        if (index === highlightedCells.length - 1) {
          dateCell.classList.add("last-date");
        }
      }
    });
  }, [highlightedCells, currentCells]);

  /*   useEffect(() => {
    const unavailableDates = currentCells.filter(
      (cell) => !cell.props.available
    );
    const groupedUnavailableDates = groupUnavailableDates(unavailableDates);

    groupedUnavailableDates.forEach((group) => {
      group.forEach((cell, index) => {
        const cellElement = cell.ref.current; // Access the underlying DOM element
        const position = determinePosition(index, group.length);

        if (position === "first") {
          cellElement.classList.add("first-date");
        } else if (position === "last") {
          cellElement.classList.add("last-date");
        } else {
          cellElement.classList.add("day-blocked");
        }
      });
    });
  }, [currentCells]); */

  const addClassesToDates = (datesArray) => {
    const lastDayPrevMonth = new Date(currentYear, currentMonth, 1);
    const dateToUTCTime = lastDayPrevMonth.setUTCHours(0, 0, 0, 0);
    const dateToISO = new Date(dateToUTCTime).toISOString();

    let foundDate;
    for (const dateObj of dates) {
      if (dateObj.date === dateToISO) {
        foundDate = dateObj.available;
        break;
      }
    }

    return datesArray.map((date, index, array) => {
      if (!foundDate && datesArray[0].available) {
        datesArray[0].className = "morning-blocked";
      }
      if (!foundDate && !datesArray[0].available) {
        datesArray[0].className = "day-blocked";
      }
      if (!date.available) {
        if (date.className !== "day-blocked") {
          date.className = "evening-blocked";
        }
        if (index < array.length - 1) {
          const nextDate = array[index + 1];
          if (!nextDate.available) {
            nextDate.className = "day-blocked";
          } else {
            nextDate.className = "morning-blocked";
          }
        }
      }

      return date;
    });
  };

  const handleMouseOver = (e) => {
    if (range.startDate) {
      const targetDateElement = e.target.closest(".day");
      if (targetDateElement) {
        const dateHovered = new Date(
          targetDateElement.getAttribute("data-date")
        );
        const cellsArray = Array.from(daysWrapper.current.childNodes);
        const filteredCells = cellsArray.filter((cell) => {
          const cellDateStr = cell.getAttribute("data-date");
          if (cellDateStr) {
            const cellDate = new Date(cellDateStr);
            return cellDate >= range.startDate && cellDate <= dateHovered;
          }
        });
        const highlightedDates = filteredCells.map((dateCell) =>
          dateCell.getAttribute("data-date")
        );
        setHighlightedCells(highlightedDates);
      }
    }
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
              const canNavigate = checkEarliestDate();
              canNavigate &&
                setCurrentMonth(currentMonth === 0 ? 11 : currentMonth - 1);
              canNavigate &&
                currentMonth === 0 &&
                setCurrentYear(currentYear - 1);
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
              checkLatestDate() &&
                setCurrentMonth(currentMonth === 11 ? 0 : currentMonth + 1),
                currentMonth === 11 && setCurrentYear(currentYear + 1);
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
            {currentMonthDates &&
              currentMonthDates.map((dateObj) => (
                <DayCell
                  key={dateObj.date}
                  rate={dateObj.rate}
                  available={dateObj.available}
                  date={dateObj.date}
                  className={dateObj.className}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
