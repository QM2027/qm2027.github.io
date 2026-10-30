export type Diet = "vegetarian" | "vegan" | "no-pork" | "no-seafood" | "gluten-free";

export const DIETS: Record<Diet, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "no-pork": "No pork",
  "no-seafood": "No seafood",
  "gluten-free": "Gluten-free",
};

export type Dish = {
  id: string;
  name: string;
  nameKo: string;
  emoji: string;
  text: string;
  /** Diets the dish usually fits. Always confirm, since broths and sauces vary. */
  fits: Diet[];
  where: string;
  spicy?: boolean;
};

export const DISHES: Dish[] = [
  { id: "black-pork", name: "Jeju black pork BBQ", nameKo: "흑돼지구이", emoji: "🥓", text: "Thick-cut pork from Jeju's native black pig, grilled at the table and dipped in anchovy sauce (멜젓).", fits: ["no-seafood", "gluten-free"], where: "Everywhere; Jungmun and Seogwipo have many grill houses" },
  { id: "gogi-guksu", name: "Gogi-guksu", nameKo: "고기국수", emoji: "🍜", text: "Thick wheat noodles in a rich pork-bone broth, topped with sliced pork. Jeju's comfort food.", fits: ["no-seafood"], where: "Noodle shops in Jeju City and Seogwipo" },
  { id: "galchi", name: "Hairtail stew / grilled hairtail", nameKo: "갈치조림 / 갈치구이", emoji: "🐟", text: "Silver hairtail (cutlassfish) braised in spicy sauce or grilled whole. Usually served for 2 or more.", fits: ["no-pork", "gluten-free"], where: "Seogwipo harbour area", spicy: true },
  { id: "okdom", name: "Grilled tilefish", nameKo: "옥돔구이", emoji: "🐠", text: "Half-dried red tilefish grilled until crisp. A Jeju breakfast classic.", fits: ["no-pork", "gluten-free"], where: "Set-menu restaurants, hotel breakfasts" },
  { id: "jeonbok-juk", name: "Abalone porridge", nameKo: "전복죽", emoji: "🥣", text: "Rice porridge with abalone, green from the liver. Gentle and good after a long flight.", fits: ["no-pork", "gluten-free"], where: "Haenyeo houses on the east coast, breakfast shops" },
  { id: "haemul-ttukbaegi", name: "Seafood hot pot", nameKo: "해물뚝배기", emoji: "🦀", text: "Bubbling clay pot of clams, crab, shrimp and abalone in a soybean-paste broth.", fits: ["no-pork"], where: "Seogwipo and the coast roads", spicy: true },
  { id: "momguk", name: "Momguk", nameKo: "몸국", emoji: "🍲", text: "Pork broth thickened with gulfweed (seaweed). A traditional festival dish.", fits: [], where: "Local restaurants in Jeju City" },
  { id: "bingtteok", name: "Bingtteok", nameKo: "빙떡", emoji: "🌯", text: "Thin buckwheat crepe rolled around seasoned radish. Light and often vegetarian (ask about the filling).", fits: ["vegetarian", "vegan", "no-pork", "no-seafood"], where: "Traditional markets" },
  { id: "omegi", name: "Omegi rice cake", nameKo: "오메기떡", emoji: "🍡", text: "Chewy millet and mugwort rice cake coated in red bean. A good souvenir; keep it frozen.", fits: ["vegetarian", "vegan", "no-pork", "no-seafood", "gluten-free"], where: "Olle Market, Dongmun Market, airport" },
  { id: "bibimbap", name: "Bibimbap (veggie)", nameKo: "비빔밥", emoji: "🍚", text: "Rice with seasoned vegetables. Ask for no meat and no egg if needed. Gochujang is usually vegan but can contain wheat.", fits: ["vegetarian", "no-pork", "no-seafood"], where: "Most Korean restaurants", spicy: true },
  { id: "citrus", name: "Hallabong & cheonhyehyang", nameKo: "한라봉 · 천혜향", emoji: "🍊", text: "Sweet Jeju citrus, at its best in March. Also try the fresh juice and tangerine chocolate.", fits: ["vegetarian", "vegan", "no-pork", "no-seafood", "gluten-free"], where: "Markets, roadside stands" },
  { id: "green-tea", name: "Jeju green tea desserts", nameKo: "녹차 디저트", emoji: "🍵", text: "Green tea ice cream, roll cake and lattes from the island's tea fields.", fits: ["vegetarian", "no-pork", "no-seafood"], where: "O'sulloc Tea Museum, cafés" },
  { id: "hoe", name: "Raw fish & sea urchin", nameKo: "회 · 성게", emoji: "🍣", text: "Fresh catch sold by the haenyeo divers; try sea urchin (성게) or conch (소라).", fits: ["no-pork", "gluten-free"], where: "Haenyeo stands at Seongsan, Olle Market" },
];

export type Phrase = { id: string; en: string; ko: string };

export const PHRASES: Phrase[] = [
  { id: "veg", en: "I'm vegetarian. No meat, no fish.", ko: "저는 채식주의자예요. 고기와 생선은 먹지 않아요." },
  { id: "vegan", en: "I'm vegan. No meat, fish, egg or dairy.", ko: "저는 비건이에요. 고기, 생선, 계란, 유제품을 먹지 않아요." },
  { id: "broth", en: "No anchovy broth or fish sauce, please.", ko: "멸치 육수나 젓갈도 넣지 말아 주세요." },
  { id: "pork", en: "No pork, please.", ko: "돼지고기는 빼 주세요." },
  { id: "halal", en: "Is this halal? I don't eat pork or alcohol.", ko: "할랄 음식인가요? 돼지고기와 술은 먹지 않아요." },
  { id: "shellfish", en: "I'm allergic to shellfish.", ko: "저는 갑각류와 조개 알레르기가 있어요." },
  { id: "nuts", en: "I'm allergic to nuts.", ko: "저는 견과류 알레르기가 있어요." },
  { id: "gluten", en: "I can't eat wheat (gluten).", ko: "저는 밀가루를 먹을 수 없어요." },
  { id: "mild", en: "Not spicy, please.", ko: "안 맵게 해 주세요." },
  { id: "bill", en: "The bill, please.", ko: "계산해 주세요." },
];
