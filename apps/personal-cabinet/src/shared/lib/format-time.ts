export const formatTimeAgo = (date: string | Date) => {
  const now = new Date();
  const createdAt = new Date(date);
  const diffInMs = now.getTime() - createdAt.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Сегодня";
  if (diffInDays === 1) return "1 день назад";
  if (diffInDays < 7) return `${diffInDays} дней назад`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) return "1 неделю назад";
  return `${diffInWeeks} недель назад`;
}; 