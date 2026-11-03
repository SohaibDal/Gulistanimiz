import { getAllPoems } from "./poems";
import poets from "../data/poets.json";

export function getRandomPoemForNotification() {
  const poems = getAllPoems();
  const poem = poems[Math.floor(Math.random() * poems.length)];
  const poet = poets.find((p) => p.id === poem.poetId);

  return {
    body: poem.transliteration || poem.original,
    poet: poet?.name ?? ""
  };
}
