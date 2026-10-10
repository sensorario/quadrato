import React from "react";
import { useTranslation } from "react-i18next";
import { dayKey, offsetDay } from "../utils/taskDays";

// As in Nutrimondo: ‹ the day before, the day shown (a click goes back to today), the day after ›.
export const DayNavigator = ({ day, onChange }: { day: string; onChange: (day: string) => void }) => {
    const { t, i18n } = useTranslation();
    const today = dayKey(new Date());
    const isToday = day === today;

    return (
        <div className="day-nav">
            <button
                type="button"
                className="day-nav-step"
                onClick={() => onChange(offsetDay(day, -1))}
                title={t("dayTasks.previousDay")}
                aria-label={t("dayTasks.previousDay")}
            >
                ‹
            </button>
            <button
                type="button"
                className={`day-nav-current${isToday ? " day-nav-today" : ""}`}
                onClick={() => onChange(today)}
                title={isToday ? undefined : t("dayTasks.backToToday")}
            >
                {isToday
                    ? t("dayTasks.today")
                    : new Date(`${day}T12:00:00`).toLocaleDateString(i18n.language, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                      })}
            </button>
            <button
                type="button"
                className="day-nav-step"
                onClick={() => onChange(offsetDay(day, 1))}
                title={t("dayTasks.nextDay")}
                aria-label={t("dayTasks.nextDay")}
            >
                ›
            </button>
        </div>
    );
};

export default DayNavigator;
