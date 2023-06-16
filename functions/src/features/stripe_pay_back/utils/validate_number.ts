export const validateNumber = (strNumber: string): boolean => {
  const regExp = new RegExp("^\\d+$");
  const isValid = regExp.test(strNumber);
  return isValid;
};
