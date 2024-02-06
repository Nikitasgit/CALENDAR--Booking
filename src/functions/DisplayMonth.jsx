export const findPrevMonthDates = (currentYear, currentMonth) => {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const firstDayCell = firstDay.getDay() !== 0 ? firstDay.getDay() : 7;
  const lastDatePrevMonth = new Date(firstDay.setDate(0));
  const year = lastDatePrevMonth.getFullYear();
  const month = lastDatePrevMonth.getMonth();
  const daysPrevMonth = lastDatePrevMonth.getDate();
  let countPrevMonthStart = daysPrevMonth - firstDayCell + 1;
  const prevMonthDates = [];
  for (let i = 1; i < firstDayCell; i++) {
    countPrevMonthStart += 1;
    prevMonthDates.push({
      date: new Date(year, month, countPrevMonthStart).toISOString(),
      rate: null,
      available: false,
      className: "disabled-day",
    });
  }

  return prevMonthDates;
};
export const getMissingDates = (givenDates, currentYear, currentMonth) => {
  const firstDay = new Date(currentYear, currentMonth, 2);
  const lastDay = new Date(currentYear, currentMonth + 1, 1);
  const allDatesArray = getDatesBetween(firstDay, lastDay);
  const existingDates = givenDates.map((item) => item.date);
  const missingDates = allDatesArray
    .filter((date) => !existingDates.includes(date))
    .map((date) => ({
      date: date,
      available: false,
      rate: null,
      className: "day-blocked",
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

  return missingDates;
};

export const findNextMonthDates = (
  prevDates,
  missingDates,
  existingDates,
  currentYear,
  currentMonth
) => {
  const nextMonthDates = [];
  const nextMonthFirstDate = new Date(
    currentYear + (currentMonth === 11 ? 1 : 0),
    (currentMonth + 1) % 12,
    2
  );
  const cellsMissing = 42 - prevDates - missingDates - existingDates;

  for (let i = 0; i < cellsMissing; i++) {
    const dateWithZeroTime = new Date(nextMonthFirstDate);
    dateWithZeroTime.setUTCHours(0, 0, 0, 0);
    nextMonthDates.push({
      date: new Date(dateWithZeroTime).toISOString(),
      available: false,
      rate: null,
      className: "disabled-day",
    });
    nextMonthFirstDate.setDate(nextMonthFirstDate.getDate() + 1);
  }
  return nextMonthDates;
};
export const getDatesBetween = (startDate, endDate) => {
  let dates = [];
  const currentStartDate = new Date(startDate);
  const currentEndDate = new Date(endDate);

  currentStartDate.setUTCHours(0, 0, 0, 0);
  currentEndDate.setUTCHours(0, 0, 0, 0);

  let currentDate = new Date(currentStartDate);

  while (currentDate <= currentEndDate) {
    dates.push(currentDate.toISOString());
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

export const addClassesToDates = (datesArray, dates, lastDayPrevMonth) => {
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
