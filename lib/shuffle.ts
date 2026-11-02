export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }

  if (result.length > 1 && result.every((item, index) => item === items[index])) {
    result.push(result.shift()!);
  }

  return result;
}
