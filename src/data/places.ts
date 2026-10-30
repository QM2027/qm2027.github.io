// Coordinates are approximate and must be checked against Kakao/Naver Map before launch.

export type Category = "sight" | "nature" | "culture" | "food" | "transport" | "health";

export type Place = {
  id: string;
  name: string;
  nameKo: string;
  category: Category;
  lat: number;
  lng: number;
  summary: string;
  /** Typical time to spend on site, in minutes. */
  durationMin: number;
  /** Good on rainy or windy days. */
  indoor?: boolean;
  /** Something seasonal that overlaps the conference week. */
  march?: string;
  /** Free-form tags. Filters use "family" (good with children) and "accessible" (step-free main route). */
  tags?: string[];
};

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  sight: { label: "Sights", color: "#0e7490" },
  nature: { label: "Nature & Hiking", color: "#15803d" },
  culture: { label: "Museums & Culture", color: "#7c3aed" },
  food: { label: "Food & Markets", color: "#ea580c" },
  transport: { label: "Transport", color: "#475569" },
  health: { label: "Medical", color: "#dc2626" },
};

export const PLACES: Place[] = [
  // Jungmun — walking distance from ICC Jeju
  { id: "jusangjeolli", name: "Jusangjeolli Cliff", nameKo: "대포동 주상절리대", category: "sight", lat: 33.2378, lng: 126.4253, durationMin: 40, summary: "Hexagonal basalt columns formed as a lava flow cooled against the sea. 10 minutes' walk from the venue.", tags: ["walkable", "geology", "UNESCO Geopark", "photo"] },
  { id: "saekdal", name: "Jungmun Saekdal Beach", nameKo: "중문색달해수욕장", category: "nature", lat: 33.2445, lng: 126.4119, durationMin: 45, summary: "Black-and-white sand beach below the resort cliffs; popular with surfers year-round.", tags: ["walkable", "sunset", "family", "photo"] },
  { id: "cheonjeyeon", name: "Cheonjeyeon Falls", nameKo: "천제연폭포", category: "nature", lat: 33.2523, lng: 126.4183, durationMin: 60, summary: "Three-tier waterfall in a subtropical gorge, crossed by the arched Seonimgyo Bridge.", tags: ["walkable", "photo"] },
  { id: "yeomiji", name: "Yeomiji Botanical Garden", nameKo: "여미지식물원", category: "nature", lat: 33.2496, lng: 126.4178, durationMin: 75, indoor: true, summary: "Large glasshouse garden next to the venue. Works on a rainy day.", tags: ["walkable", "family", "accessible"] },
  { id: "teddy", name: "Teddy Bear Museum", nameKo: "테디베어뮤지엄", category: "culture", lat: 33.2502, lng: 126.4122, durationMin: 60, indoor: true, summary: "Light-hearted museum in the Jungmun complex; easy with children.", tags: ["walkable", "family", "accessible"] },
  { id: "olle8", name: "Olle Trail Route 8", nameKo: "올레 8코스", category: "nature", lat: 33.2398, lng: 126.4176, durationMin: 120, summary: "The coastal Olle trail passes ICC Jeju. Good for an early walk or run.", tags: ["walkable", "running"] },

  // Seogwipo city
  { id: "cheonjiyeon", name: "Cheonjiyeon Falls", nameKo: "천지연폭포", category: "nature", lat: 33.2469, lng: 126.5543, durationMin: 45, summary: "22 m waterfall at the end of a lit path. Open in the evening.", tags: ["evening", "family", "accessible"] },
  { id: "jeongbang", name: "Jeongbang Falls", nameKo: "정방폭포", category: "nature", lat: 33.2448, lng: 126.5719, durationMin: 40, summary: "One of the few waterfalls in Asia that drops straight into the sea." },
  { id: "oedolgae", name: "Oedolgae Rock", nameKo: "외돌개", category: "sight", lat: 33.2394, lng: 126.5446, durationMin: 40, summary: "Lone volcanic sea stack on Olle Route 7 with cliffside views.", tags: ["geology", "photo"] },
  { id: "leejungseop", name: "Lee Jung-seop Street & Art Museum", nameKo: "이중섭거리·미술관", category: "culture", lat: 33.2471, lng: 126.565, durationMin: 60, indoor: true, summary: "Former home and museum of the modernist painter Lee Jung-seop, on a street of small galleries and cafés.", tags: ["accessible"] },
  { id: "olle-market", name: "Seogwipo Maeil Olle Market", nameKo: "서귀포매일올레시장", category: "food", lat: 33.2494, lng: 126.5636, durationMin: 60, indoor: true, summary: "Covered market for street food, tangerines and hallabong. Busiest in the evening.", tags: ["evening", "souvenirs", "family", "accessible"] },
  { id: "astro-seogwipo", name: "Seogwipo Astronomical Science Center", nameKo: "서귀포천문과학문화관", category: "culture", lat: 33.256, lng: 126.545, durationMin: 90, indoor: true, summary: "Public observatory with evening telescope sessions; check the programme and the cloud forecast.", tags: ["science", "evening", "family"] },

  // West
  { id: "sanbangsan", name: "Sanbangsan & Yongmeori Coast", nameKo: "산방산·용머리해안", category: "sight", lat: 33.2316, lng: 126.3146, durationMin: 90, march: "Canola fields bloom around the mountain in March.", summary: "A lava dome beside a sandstone coast layered like a dragon's head. The coast path closes when the tide or waves are high.", tags: ["geology", "canola", "photo"] },
  { id: "suwolbong", name: "Suwolbong Geotrail", nameKo: "수월봉 지질트레일", category: "sight", lat: 33.2958, lng: 126.1636, durationMin: 60, summary: "Sea cliff that exposes layered hydrovolcanic ash deposits, with bomb sags where volcanic blocks punched into the beds. A key UNESCO Global Geopark site.", tags: ["geology", "UNESCO Geopark"] },
  { id: "songaksan", name: "Songaksan", nameKo: "송악산", category: "nature", lat: 33.201, lng: 126.2925, durationMin: 90, summary: "Easy coastal crater walk with views of Mara-do and Gapa-do." },
  { id: "osulloc", name: "O'sulloc Tea Museum", nameKo: "오설록 티뮤지엄", category: "culture", lat: 33.3058, lng: 126.2895, durationMin: 75, indoor: true, summary: "Green tea museum and café next to large tea fields.", tags: ["souvenirs", "family", "accessible", "photo"] },
  { id: "bonte", name: "Bonte Museum", nameKo: "본태박물관", category: "culture", lat: 33.3018, lng: 126.3936, durationMin: 90, indoor: true, summary: "Tadao Ando building that houses Korean traditional crafts and contemporary art.", tags: ["accessible", "photo"] },
  { id: "hyeopjae", name: "Hyeopjae Beach", nameKo: "협재해수욕장", category: "nature", lat: 33.394, lng: 126.2397, durationMin: 60, summary: "Turquoise water facing Biyangdo island; a classic sunset spot.", tags: ["sunset", "photo"] },
  { id: "saebyeol", name: "Saebyeol Oreum", nameKo: "새별오름", category: "nature", lat: 33.3664, lng: 126.3573, durationMin: 60, summary: "Grassy volcanic cone with a 20-minute climb; host of the Jeju Fire Festival (check whether it runs in 2027).", tags: ["oreum", "photo"] },

  // Hallasan
  { id: "yeongsil", name: "Hallasan, Yeongsil Trail", nameKo: "한라산 영실코스", category: "nature", lat: 33.3473, lng: 126.4964, durationMin: 300, summary: "The shortest and most scenic Hallasan trail, 35 minutes by car from ICC. It does not reach the summit.", tags: ["UNESCO", "hiking", "photo"] },
  { id: "seongpanak", name: "Hallasan, Seongpanak Trail", nameKo: "한라산 성판악코스", category: "nature", lat: 33.3846, lng: 126.62, durationMin: 540, summary: "Summit trail (1,947 m). Online reservation required; start before the cut-off time. See the Indico Hallasan page.", tags: ["UNESCO", "hiking", "reservation"] },

  // East
  { id: "seongsan", name: "Seongsan Ilchulbong", nameKo: "성산일출봉", category: "sight", lat: 33.4587, lng: 126.9425, durationMin: 90, march: "Canola fields surround the crater in March.", summary: "Tuff cone that rose from the sea, a UNESCO World Heritage site. Climb it at sunrise; haenyeo diving shows run at the beach below.", tags: ["UNESCO", "geology", "sunrise", "haenyeo", "photo"] },
  { id: "udo", name: "Udo Island (ferry)", nameKo: "우도 (성산항)", category: "sight", lat: 33.474, lng: 126.934, durationMin: 240, summary: "Small island 15 minutes by ferry from Seongsan Port, best explored by e-bike. Ferries stop in strong wind.", tags: ["island", "family", "photo"] },
  { id: "manjanggul", name: "Manjanggul Lava Tube", nameKo: "만장굴", category: "sight", lat: 33.5283, lng: 126.7714, durationMin: 60, indoor: true, summary: "Lava tube about 7.4 km long, part of the UNESCO Geomunoreum system. It stays near 11–21 °C all year.", tags: ["UNESCO", "geology", "family"] },
  { id: "bijarim", name: "Bijarim Forest", nameKo: "비자림", category: "nature", lat: 33.4857, lng: 126.8064, durationMin: 75, summary: "Ancient nutmeg-yew forest on flat paths of red volcanic scoria.", tags: ["family"] },
  { id: "haenyeo-museum", name: "Haenyeo Museum", nameKo: "해녀박물관", category: "culture", lat: 33.5232, lng: 126.8616, durationMin: 60, indoor: true, summary: "History of Jeju's free-diving women, listed by UNESCO as intangible heritage.", tags: ["haenyeo", "family", "accessible"] },
  { id: "aquaplanet", name: "Aqua Planet Jeju", nameKo: "아쿠아플라넷 제주", category: "culture", lat: 33.433, lng: 126.9275, durationMin: 120, indoor: true, summary: "Large aquarium near Seongsan; a family-friendly option for a rainy day.", tags: ["family", "accessible"] },
  { id: "noksanro", name: "Noksan-ro Canola Road", nameKo: "녹산로 유채꽃길", category: "nature", lat: 33.387, lng: 126.752, durationMin: 45, march: "Canola and cherry blossoms line a 10 km road, usually peaking in late March to early April.", summary: "Scenic drive lined with canola and cherry trees.", tags: ["canola", "cherry blossom", "drive", "photo"] },
  { id: "saryeoni", name: "Saryeoni Forest Path", nameKo: "사려니숲길", category: "nature", lat: 33.4135, lng: 126.6385, durationMin: 120, summary: "Cedar forest walk in the Hallasan biosphere reserve." },

  { id: "saeyeongyo", name: "Saeyeongyo Bridge & Saeseom", nameKo: "새연교·새섬", category: "sight", lat: 33.2389, lng: 126.5596, durationMin: 45, summary: "Sail-shaped footbridge to a tiny island trail off Seogwipo harbour. Lit up at night.", tags: ["evening", "photo"] },
  { id: "gwangchigi", name: "Gwangchigi Beach", nameKo: "광치기해변", category: "nature", lat: 33.4525, lng: 126.9245, durationMin: 30, summary: "Mossy lava rocks at low tide with Seongsan Ilchulbong behind. A classic sunrise photo.", tags: ["sunrise", "photo"] },
  { id: "hamdeok", name: "Hamdeok Beach", nameKo: "함덕해수욕장", category: "nature", lat: 33.5434, lng: 126.6697, durationMin: 60, summary: "Shallow emerald water and a small oreum to climb for the view. 20 minutes from the airport.", tags: ["photo", "family"] },

  // Jeju City
  { id: "dongmun", name: "Dongmun Market & Night Market", nameKo: "동문시장 야시장", category: "food", lat: 33.5116, lng: 126.5262, durationMin: 75, summary: "Jeju City's main market. The night-market stalls open around 18:00.", tags: ["evening", "souvenirs", "family", "accessible"] },
  { id: "jeonnongro", name: "Jeonnong-ro Cherry Blossoms", nameKo: "전농로 왕벚꽃거리", category: "nature", lat: 33.5034, lng: 126.521, durationMin: 30, march: "King cherry blossoms usually open in the last week of March.", summary: "Street lined with Jeju's native king cherry trees.", tags: ["cherry blossom", "accessible", "photo"] },
  { id: "peace-park", name: "Jeju 4·3 Peace Park", nameKo: "제주4·3평화공원", category: "culture", lat: 33.4507, lng: 126.6704, durationMin: 90, indoor: true, summary: "Memorial and museum for the Jeju 4·3 tragedy (1947–54), essential for understanding the island's modern history.", tags: ["accessible"] },

  // Transport
  { id: "cju", name: "Jeju International Airport (CJU)", nameKo: "제주국제공항", category: "transport", lat: 33.507, lng: 126.493, durationMin: 0, summary: "Arrivals on the first floor. The Airport Limousine 600 stop is outside Gate 5 (verify)." },
  { id: "seongsan-port", name: "Seongsan Port (Udo ferry)", nameKo: "성산항", category: "transport", lat: 33.4742, lng: 126.9319, durationMin: 0, summary: "Ferries to Udo run about every 30 minutes. Bring your passport." },

  // Medical
  { id: "seogwipo-medical", name: "Seogwipo Medical Center", nameKo: "서귀포의료원", category: "health", lat: 33.2564, lng: 126.5643, durationMin: 0, summary: "Nearest public hospital with a 24-hour emergency room. Call 119 for an ambulance." },
  { id: "jnuh", name: "Jeju National University Hospital", nameKo: "제주대학교병원", category: "health", lat: 33.4673, lng: 126.545, durationMin: 0, summary: "Main tertiary hospital on the island, with a 24-hour emergency room." },
];

export type Course = {
  id: string;
  title: string;
  length: string;
  blurb: string;
  stops: string[];
};

export const COURSES: Course[] = [
  {
    id: "jungmun-walk",
    title: "Jungmun on foot",
    length: "2–3 h after sessions",
    blurb: "Basalt columns, a waterfall gorge and the beach at sunset, all without a car.",
    stops: ["jusangjeolli", "olle8", "saekdal", "cheonjeyeon"],
  },
  {
    id: "seogwipo-evening",
    title: "Seogwipo evening",
    length: "Half day · taxi or bus",
    blurb: "A sea stack, a waterfall walk after dark and dinner at the market.",
    stops: ["oedolgae", "leejungseop", "cheonjiyeon", "olle-market"],
  },
  {
    id: "east-unesco",
    title: "East Jeju: volcanic sites",
    length: "Full day · car or tour",
    blurb: "Sunrise crater, a lava tube and canola roads: Jeju's volcanic story in one loop.",
    stops: ["seongsan", "udo", "manjanggul", "bijarim", "noksanro"],
  },
  {
    id: "west-art",
    title: "West Jeju: art, tea and coast",
    length: "Full day · car",
    blurb: "Ando architecture, tea fields, a lava dome and a turquoise beach at sunset.",
    stops: ["bonte", "osulloc", "sanbangsan", "songaksan", "hyeopjae"],
  },
];

export const placeById = (id: string) => PLACES.find((p) => p.id === id);
