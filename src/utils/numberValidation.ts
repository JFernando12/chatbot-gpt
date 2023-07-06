export const numberValidation = (number: string) => {
  if (!number) {
    throw new Error('Proporcina numero de whats');
  }
  if (number.length !== 10) {
    throw new Error('Proporciona numero valido');
  }
  return;
};