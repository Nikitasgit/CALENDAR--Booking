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
    .map((date) => {
      return {
        date: date,
        available: false,
        rate: null,
        className: "disabled-day",
      };
    });
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
const getDatesBetween = (startDate, endDate) => {
  let dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateWithZeroTime = new Date(currentDate);
    dateWithZeroTime.setUTCHours(0, 0, 0, 0);
    dates.push(dateWithZeroTime.toISOString());
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
