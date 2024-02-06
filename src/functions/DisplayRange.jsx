import { getDatesBetween } from "./DisplayMonth";

const clearSelectionClasses = () => {
  document.querySelectorAll(".morning-blocked-selected").forEach((el) => {
    el.classList.remove("morning-blocked-selected");
  });
  document.querySelectorAll(".startDate").forEach((el) => {
    el.classList.remove("startDate");
  });
  document.querySelectorAll(".endDate").forEach((el) => {
    el.classList.remove("endDate");
  });
  document.querySelectorAll(".highlighted").forEach((el) => {
    el.classList.remove("highlighted");
  });
  document.querySelectorAll(".evening-blocked-selected").forEach((el) => {
    el.classList.remove("evening-blocked-selected");
  });
};

export const handleCursorOut = () => {
  document.querySelectorAll(".startDate-hover").forEach((el) => {
    el.classList.remove("startDate-hover");
  });
  document.querySelectorAll(".morning-blocked-hover").forEach((el) => {
    el.classList.remove("morning-blocked-hover");
  });
  document.querySelectorAll(".evening-blocked-hover").forEach((el) => {
    el.classList.remove("evening-blocked-hover");
  });
};
