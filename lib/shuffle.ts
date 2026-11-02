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

/** Shuffle every card, treating saved cards as one randomly placed group. */
export function shuffleWithFavorites<T extends { id: string }>(
  items: readonly T[],
  savedIds: ReadonlySet<string>,
  random: () => number = Math.random,
): T[] {
  const favorites = items.filter((item) => savedIds.has(item.id));
  if (favorites.length === 0 || favorites.length === items.length) {
    return shuffle(items, random);
  }

  const group = shuffle(favorites, random);
  const others = shuffle(items.filter((item) => !savedIds.has(item.id)), random);
  let position = Math.floor(random() * (others.length + 1));
  const insertGroup = () => [...others.slice(0, position), ...group, ...others.slice(position)];
  let result = insertGroup();

  if (result.every((item, index) => item === items[index])) {
    position = (position + 1) % (others.length + 1);
    result = insertGroup();
  }

  return result;
}

/** Keep the full list, placing saved cards together near its center. */
export function groupFavorites<T extends { id: string }>(
  items: readonly T[],
  savedIds: ReadonlySet<string>,
): T[] {
  const favorites = items.filter((item) => savedIds.has(item.id));
  if (favorites.length === 0 || favorites.length === items.length) return [...items];

  const others = items.filter((item) => !savedIds.has(item.id));
  const position = Math.floor(others.length / 2);
  return [...others.slice(0, position), ...favorites, ...others.slice(position)];
}
