export function formatRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((Number(now) - date) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const secondsInMinute = 60;
  const secondsInHour = 3600;
  const secondsInDay = 86400;
  const secondsInMonth = 2592000;
  const secondsInYear = 31536000;

  if (diffInSeconds < secondsInMinute) {
    return rtf.format(-diffInSeconds, "second");
  } else if (diffInSeconds < secondsInHour) {
    return rtf.format(-Math.floor(diffInSeconds / secondsInMinute), "minute");
  } else if (diffInSeconds < secondsInDay) {
    return rtf.format(-Math.floor(diffInSeconds / secondsInHour), "hour");
  } else if (diffInSeconds < secondsInMonth) {
    return rtf.format(-Math.floor(diffInSeconds / secondsInDay), "day");
  } else if (diffInSeconds < secondsInYear) {
    return rtf.format(-Math.floor(diffInSeconds / secondsInMonth), "month");
  } else {
    return rtf.format(-Math.floor(diffInSeconds / secondsInYear), "year");
  }
}
