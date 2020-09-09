export const formatDate = (date: string) => date
  .replace(/T/, " ")
  .replace(/\..+/, "")
  .slice(0, -3);
