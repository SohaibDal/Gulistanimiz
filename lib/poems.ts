import poems from "../data/poems.json";
import poets from "../data/poets.json";

export function getAllPoems() {
  return poems;
}

export function getPoemsByPoet(poetId: string) {
  return poems.filter((p) => p.poetId === poetId);
}

export function getPoetsWithCounts() {
  return poets.map((poet) => {
    const count = poems.filter((p) => p.poetId === poet.id).length;
    return { ...poet, count };
  });
}

export function getPoemsByGenre(genre: string) {
  return poems.filter((p) => p.genre === genre);
}

export function getGenresWithCounts() {
  const map: Record<string, number> = {};

  poems.forEach((poem) => {
    map[poem.genre] = (map[poem.genre] || 0) + 1;
  });

  return Object.entries(map).map(([genre, count]) => ({
    genre,
    count
  }));
}
