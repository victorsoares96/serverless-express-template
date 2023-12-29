function generateRandomNumber(min = 0, max = 65536): number {
  const Min = Math.ceil(min);
  const Max = Math.floor(max);
  return Math.floor(Math.random() * (Max - Min) + Min);
}

export default generateRandomNumber;
