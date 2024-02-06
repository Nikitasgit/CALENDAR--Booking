import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import DayCell from "./DayCell";
import chevronRight from "../assets/icons/right-chevron.png";
import chevronLeft from "../assets/icons/left-chevron.png";
import {
  addClassesToDates,
  addClassesToDatesCopy,
  findNextMonthDates,
  findPrevMonthDates,
  getDatesBetween,
  getMissingDates,
} from "../functions/DisplayMonth";
import { handleCursorOut } from "../functions/DisplayRange";

const Calendar = () => {
  const [dates, setDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [range, setRange] = useState({});
  const [selection, setSelection] = useState([]);
  const [firstUnavailableElement, setFirstUnavailableElement] = useState();
  const [currentMonthDates, setCurrentMonthDates] = useState();
  const [editing, setEditing] = useState(true);
  const [disable, setdisable] = useState(true);
  const [classMode, setClassMode] = useState();
  const { earliestDate, latestDate } = findMinMaxDates(dates);
  const daysWrapper = useRef(null);
  //USEEFFECTS
  useEffect(() => {
    editing && disable ? setClassMode("-red") : setClassMode("");
  }, [disable]);
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
      lastDayPrevMonth,
      editing
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
    renderSelection();
  }, [currentMonthDates, range.startDate, range.endDate]);
  useEffect(() => {
    range.startDate && !editing && findFirstUnavailableDate(range.startDate);
  }, [range.startDate]);

  //FUNCTIONS

  const renderSelection = () => {
    if (range.startDate) {
      clearSelectionClasses();
      const dayElements = Array.from(daysWrapper.current.children);
      dayElements.forEach((day) => {
        if (range.startDate) {
          const dayDate = new Date(day.getAttribute("data-date"));
          if (
            dayDate.getTime() == range.startDate.getTime() &&
            !day.classList.contains("disabled-day")
          ) {
            if (
              day.classList.contains("morning-blocked") ||
              day.classList.contains("day-blocked")
            ) {
              day.classList.add(`morning-blocked-selected${classMode}`);
            } else {
              day.classList.add(`startDate${classMode}`);
            }
          }
          if (range.endDate) {
            if (
              dayDate.getTime() == range.endDate?.getTime() &&
              !day.classList.contains("disabled-day")
            ) {
              if (
                day.classList.contains("evening-blocked") ||
                day.classList.contains("day-blocked")
              ) {
                day.classList.add(`evening-blocked-selected${classMode}`);
              } else {
                day.classList.add(`endDate${classMode}`);
              }
            } else if (
              selection?.includes(dayDate?.toISOString()) &&
              !day.classList.contains("disabled-day")
            ) {
              day.classList.add(`highlighted${classMode}`);
            }
          }
        }
      });
    }
  };

  const findFirstUnavailableDate = (date) => {
    if (date && daysWrapper.current) {
      const startToString = date.toISOString();
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
            return setFirstUnavailableElement(currentDay);
          } else setFirstUnavailableElement(null);
        }
      }
    }
  };
  const clearSelectionClasses = () => {
    document
      .querySelectorAll(`.morning-blocked-selected${classMode}`)
      .forEach((el) => {
        el.classList.remove(`morning-blocked-selected${classMode}`);
      });
    document
      .querySelectorAll(`.evening-blocked-hover${classMode}`)
      .forEach((el) => {
        el.classList.remove(`evening-blocked-hover${classMode}`);
      });

    document.querySelectorAll(`.startDate${classMode}`).forEach((el) => {
      el.classList.remove(`startDate${classMode}`);
    });

    document.querySelectorAll(`.endDate${classMode}`).forEach((el) => {
      el.classList.remove(`endDate${classMode}`);
    });
    document.querySelectorAll(`.endDate-hover${classMode}`).forEach((el) => {
      el.classList.remove(`endDate-hover${classMode}`);
    });

    document.querySelectorAll(`.highlighted${classMode}`).forEach((el) => {
      el.classList.remove(`highlighted${classMode}`);
    });

    document
      .querySelectorAll(`.evening-blocked-selected${classMode}`)
      .forEach((el) => {
        el.classList.remove(`evening-blocked-selected${classMode}`);
      });
  };

  const handleDateClick = (e) => {
    const targetDateElement = e.target.closest(".day");
    if (!targetDateElement) return;
    const targetDate = targetDateElement.getAttribute("data-date");
    const dateClicked = new Date(targetDate);
    const firstUnavailableDate = new Date(
      firstUnavailableElement?.getAttribute("data-date")
    );
    if (
      (!range.startDate && !range.endDate) ||
      (range.startDate && range.endDate) ||
      dateClicked > firstUnavailableDate ||
      dateClicked < range.startDate
    ) {
      return setRange({ startDate: dateClicked, endDate: null });
    } else if (range.startDate && !range.endDate) {
      if (
        (dateClicked > range.startDate &&
          dateClicked <= firstUnavailableDate) ||
        (dateClicked > range.startDate && !firstUnavailableElement)
      ) {
        setSelection(getDatesBetween(range.startDate, dateClicked));
        setRange({
          startDate: range.startDate,
          endDate: dateClicked,
        });
      }
    }
  };
  const clearExistingHoverClasses = () => {
    document.querySelectorAll(`.startDate-hover${classMode}`).forEach((el) => {
      el.classList.remove(`startDate-hover${classMode}`);
    });
    document
      .querySelectorAll(`.morning-blocked-hover${classMode}`)
      .forEach((el) => {
        el.classList.remove(`morning-blocked-hover${classMode}`);
      });
    document.querySelectorAll(".evening-stop").forEach((el) => {
      el.classList.remove("evening-stop");
    });
    if (range.startDate && !range.endDate) {
      document.querySelectorAll(`.endDate-hover${classMode}`).forEach((el) => {
        el.classList.remove(`endDate-hover${classMode}`);
      });
      document.querySelectorAll(`.highlighted${classMode}`).forEach((el) => {
        el.classList.remove(`highlighted${classMode}`);
      });
      document
        .querySelectorAll(`.evening-blocked-hover${classMode}`)
        .forEach((el) => {
          el.classList.remove(`evening-blocked-hover${classMode}`);
        });
    }
  };
  const handleMouseHover = (e) => {
    const targetDateElement = e.target.closest(".day");

    if (targetDateElement) {
      const date = new Date(targetDateElement.getAttribute("data-date"));
      const firstUnavailableDate = new Date(
        firstUnavailableElement?.getAttribute("data-date")
      );

      clearExistingHoverClasses();

      if (range.startDate && !range.endDate) {
        const endDateToHighlight = firstUnavailableElement
          ? firstUnavailableDate
          : date;
        const currentDates = getDatesBetween(
          range.startDate,
          endDateToHighlight
        );

        const dayElements = Array.from(daysWrapper.current.children);
        dayElements.forEach((day) => {
          const dayDate = new Date(day.getAttribute("data-date"));

          if (currentDates?.includes(dayDate.toISOString())) {
            if (dayDate < date && dayDate > range.startDate) {
              day.classList.add(`highlighted${classMode}`);
            } else if (
              dayDate.getTime() === date.getTime() &&
              dayDate.getTime() !== range.startDate.getTime()
            ) {
              if (
                day.classList.contains("evening-blocked") ||
                day.classList.contains("day-blocked")
              ) {
                day.classList.add(`evening-blocked-hover${classMode}`);
              } else {
                day.classList.add(`endDate-hover${classMode}`);
              }
            }
          }

          if (date > firstUnavailableDate) {
            firstUnavailableElement.classList.add(
              `evening-blocked-hover${classMode}`
            );
          }
        });
      }

      if (
        firstUnavailableDate < date ||
        date < range.startDate ||
        (range.startDate && range.endDate) ||
        (!range.startDate && !range.endDate)
      ) {
        if (
          targetDateElement.classList.contains("morning-blocked") ||
          targetDateElement.classList.contains("day-blocked")
        ) {
          targetDateElement.classList.add(`morning-blocked-hover${classMode}`);
        } else if (
          targetDateElement.classList.contains("evening-blocked") &&
          !editing
        ) {
          targetDateElement.classList.add("evening-stop");
        } else {
          targetDateElement.classList.add(`startDate-hover${classMode}`);
        }
      }
    }
  };

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

  return (
    <div className="calendar-wrapper">
      <div>
        <div className="calendar-header">
          <div className="range-first-day">
            <input
              type="text"
              defaultValue={
                range.startDate && format(range.startDate, "dd-MM-yyyy")
              }
              readOnly={true}
            />
          </div>
          <div className="range-last-day">
            <input
              readOnly={true}
              type="text"
              defaultValue={
                range.endDate &&
                range.startDate &&
                format(range.endDate, "dd-MM-yyyy")
              }
            />
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
            onMouseOver={(e) => handleMouseHover(e)}
            onMouseLeave={(e) => handleCursorOut(e)}
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
