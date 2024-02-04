import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import DayCell from "./DayCell";
import chevronRight from "../assets/icons/right-chevron.png";
import chevronLeft from "../assets/icons/left-chevron.png";
import {
  addClassesToDates,
  findNextMonthDates,
  findPrevMonthDates,
  getDatesBetween,
  getMissingDates,
} from "../functions/DisplayMonth";

const Calendar = () => {
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [startDateElement, setStartDateElement] = useState();
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
    const lastDayPrevMonth = new Date(currentYear, currentMonth, 1);
    const monthDatesExisting = addClassesToDates(
      currentMonthDates,
      dates,
      lastDayPrevMonth
    );
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

  const findFirstUnavailableDate = () => {
    if (range.startDate && daysWrapper.current) {
      const startToString = range.startDate.toISOString();
      const startIndex = Array.from(daysWrapper.current.children).findIndex(
        (day) => day.getAttribute("data-date") === startToString
      );

      if (startIndex !== -1) {
        for (
          let i = startIndex + 1;
          i < daysWrapper.current.children.length;
          i++
        ) {
          const currentDay = daysWrapper.current.children[i];
          if (currentDay.classList.contains("evening-blocked")) {
            return currentDay;
          }
        }
      }
    }
  };

  useEffect(() => {
    if (range.startDate) findFirstUnavailableDate();
  }, [range.startDate]);

  const handleDateClick = (e) => {
    const targetDateElement = e.target.closest(".day");
    if (!targetDateElement) return;
    const targetDate = targetDateElement.getAttribute("data-date");
    const dateClicked = new Date(targetDate);
    if (!range.startDate && !range.endDate) {
      if (targetDateElement.classList.contains("morning-blocked")) {
        targetDateElement.classList.add("morning-blocked-selected");
      } else {
        targetDateElement.classList.add("startDate");
      }

      setRange({ startDate: dateClicked, endDate: null });
    } else if (range.startDate && !range.endDate) {
      if (dateClicked > range.startDate) {
        if (targetDateElement.classList.contains("evening-blocked")) {
          targetDateElement.classList.add("evening-blocked-selected");
        } else {
          targetDateElement.classList.add("endDate");
        }
        setRange({
          startDate: range.startDate,
          endDate: dateClicked,
        });
      } else {
        document.querySelectorAll(".startDate").forEach((el) => {
          el.classList.remove("startDate");
        });

        targetDateElement.classList.add("startDate");
        setRange({
          startDate: dateClicked,
          endDate: null,
        });
      }
    } else {
      document.querySelectorAll(".startDate").forEach((el) => {
        el.classList.remove("startDate");
      });
      document.querySelectorAll(".morning-blocked-selected").forEach((el) => {
        el.classList.remove("morning-blocked-selected");
      });
      document.querySelectorAll(".evening-blocked-selected").forEach((el) => {
        el.classList.remove("evening-blocked-selected");
      });
      document.querySelectorAll(".highlighted").forEach((el) => {
        el.classList.remove("highlighted");
      });
      document.querySelectorAll(".endDate").forEach((el) => {
        el.classList.remove("endDate");
      });

      targetDateElement.classList.add("startDate");
      setRange({ startDate: dateClicked, endDate: null });
    }
  };

  const handleMouseOver = (e) => {
    const targetDateElement = e.target.closest(".day");
    if (targetDateElement) {
      if (!range.startDate) {
        if (targetDateElement.classList.contains("morning-blocked")) {
          document;
          document.querySelectorAll(".startDate").forEach((el) => {
            el.classList.remove("startDate");
          });
          document
            .querySelectorAll(".morning-blocked-selected")
            .forEach((el) => {
              el.classList.remove("morning-blocked-selected");
            });
          document.querySelectorAll(".stop").forEach((el) => {
            el.classList.remove("stop");
          });
          targetDateElement.classList.add("morning-blocked-selected");
        } else if (targetDateElement.classList.contains("evening-blocked")) {
          document
            .querySelectorAll(".morning-blocked-selected")
            .forEach((el) => {
              el.classList.remove("morning-blocked-selected");
            });
          document.querySelectorAll(".startDate").forEach((el) => {
            el.classList.remove("startDate");
          });
          document.querySelectorAll(".stop").forEach((el) => {
            el.classList.remove("stop");
          });
          targetDateElement.classList.add("stop");
        } else {
          document.querySelectorAll(".stop").forEach((el) => {
            el.classList.remove("stop");
          });
          document
            .querySelectorAll(".morning-blocked-selected")
            .forEach((el) => {
              el.classList.remove("morning-blocked-selected");
            });
          document.querySelectorAll(".startDate").forEach((el) => {
            el.classList.remove("startDate");
          });
          targetDateElement.classList.add("startDate");
        }
      }

      if (range.startDate) {
        const firstUnavailableElement = findFirstUnavailableDate();

        const firstUnavailableDate = new Date(
          firstUnavailableElement?.getAttribute("data-date")
        );

        const date = new Date(targetDateElement.getAttribute("data-date"));
        const currentDates = getDatesBetween(range.startDate, date);

        // Convert daysWrapper.children to an array
        const dayElements = Array.from(daysWrapper.current.children);

        // Loop through the array of day elements
        dayElements.forEach((day) => {
          const dayDate = new Date(day.getAttribute("data-date"));
          if (currentDates.includes(dayDate.toISOString())) {
            // Add your desired class
            if (dayDate < firstUnavailableDate) {
              firstUnavailableElement.classList.remove(
                "evening-blocked-selected"
              );
              day.classList.add("highlighted");
            } else {
              firstUnavailableElement.classList.add("evening-blocked-selected");
            }

            day.classList.remove("endDate");
          } else {
            // Remove the class if needed
            day.classList.remove("highlighted");
            day.classList.remove("endDate");
          }
        });

        targetDateElement.classList.add("endDate");
      }
    }
  };
  return (
    <div className="calendar-wrapper">
      <div>
        <div className="calendar-header">
          <div className="range-first-day">
            <input
              type="text"
              value={
                range.startDate &&
                format(new Date(range.startDate), "yyyy-MM-dd")
              }
              readOnly={true}
            />
          </div>
          <div className="range-last-day">
            <input readOnly={true} type="text" value={"date"} />
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
            onClick={(e) => {
              handleDateClick(e);
            }}
          >
            {currentMonthDates &&
              currentMonthDates.map((dateObj) => (
                <DayCell
                  key={dateObj.date}
                  rate={dateObj.rate}
                  available={dateObj.available}
                  date={dateObj.date}
                  className={dateObj.className ? dateObj.className : ""}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
