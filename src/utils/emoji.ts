export const numberToEmoji = [
  '0️⃣',
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣',
  '🔟',
];

export const getNumberEmoji = (number: number): string => {
  if (number < 0 || number > numberToEmoji.length) {
    return 'Unknown';
  }
  return numberToEmoji[number];
};

export const getIndexFromEmoji = (emoji: string): number => {
  return numberToEmoji.findIndex((e) => e === emoji);
};
