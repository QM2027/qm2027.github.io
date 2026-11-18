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
  /** Needs a booking or opens only on some dates, so the free-time planner leaves it out. */
  skipPlanner?: boolean;
};

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  // Muted so markers read on a grey basemap without turning the map into confetti.
  sight: { label: "Sights", color: "#1f4e79" },
  nature: { label: "Nature & Hiking", color: "#3f6b4a" },
  culture: { label: "Museums & Culture", color: "#5b4b7a" },
  food: { label: "Food & Markets", color: "#d9480f" },
  transport: { label: "Transport", color: "#555555" },
  health: { label: "Medical", color: "#b42318" },
};

export const PLACES: Place[] = [
  // Jungmun — walking distance from ICC Jeju
  { id: "jusangjeolli", name: "Jusangjeolli Cliff", nameKo: "대포동 주상절리대", category: "sight", lat: 33.2378, lng: 126.4253, durationMin: 40, summary: "Hexagonal basalt columns formed as a lava flow cooled against the sea. 10 minutes' walk from the venue.", tags: ["walkable", "geology", "UNESCO Geopark", "photo"] },
  { id: "saekdal", name: "Jungmun Saekdal Beach", nameKo: "중문색달해수욕장", category: "nature", lat: 33.2445, lng: 126.4119, durationMin: 45, summary: "Black-and-white sand beach below the resort cliffs; popular with surfers year-round.", tags: ["walkable", "sunset", "family", "photo"] },
  { id: "cheonjeyeon", name: "Cheonjeyeon Falls", nameKo: "천제연폭포", category: "nature", lat: 33.2523, lng: 126.4183, durationMin: 60, summary: "Three-tier waterfall in a subtropical gorge, crossed by the arched Seonimgyo Bridge.", tags: ["walkable", "photo"] },
  { id: "yeomiji", name: "Yeomiji Botanical Garden", nameKo: "여미지식물원", category: "nature", lat: 33.2526, lng: 126.4143, durationMin: 75, indoor: true, summary: "Large glasshouse garden next to the venue. Works on a rainy day.", tags: ["walkable", "family", "accessible"] },
  { id: "teddy", name: "Teddy Bear Museum", nameKo: "테디베어뮤지엄", category: "culture", lat: 33.2502, lng: 126.4122, durationMin: 60, indoor: true, summary: "Light-hearted museum in the Jungmun complex; easy with children.", tags: ["walkable", "family", "accessible"] },
  { id: "olle8", name: "Olle Trail Route 8", nameKo: "올레 8코스", category: "nature", lat: 33.2397, lng: 126.4233, durationMin: 120, summary: "The coastal Olle trail passes ICC Jeju. Good for an early walk or run.", tags: ["walkable", "running"] },
  { id: "eongdeongmul", name: "Eongdeongmul Valley", nameKo: "엉덩물계곡", category: "nature", lat: 33.2482, lng: 126.4134, durationMin: 30, march: "Canola flowers cover the valley slopes, usually at their best in March.", summary: "Small valley between the resort hotels and Jungmun Beach, crossed by a deck path and a footbridge. Free, open at all hours, and on Olle Route 8.", tags: ["walkable", "canola", "photo"] },
  { id: "beritnae", name: "Beritnae Oreum", nameKo: "베릿내오름", category: "nature", lat: 33.2487, lng: 126.4199, durationMin: 45, summary: "Wooded hill on the east rim of the Cheonjeyeon gorge; the name means \"stream where the stars come down\". A quiet stretch of Olle Route 8 with steps and boardwalks, free of charge.", tags: ["walkable", "oreum"] },
  { id: "alive-museum", name: "Alive Museum Jungmun", nameKo: "박물관은 살아있다 제주중문점", category: "culture", lat: 33.2549, lng: 126.4087, durationMin: 60, indoor: true, summary: "Trick-art museum where you pose inside optical-illusion paintings. Easy with children on a rainy day.", tags: ["walkable", "family", "photo"] },
  { id: "jungmun-market", name: "Jungmun Five-day Market", nameKo: "중문향토오일시장", category: "food", lat: 33.2511, lng: 126.4249, durationMin: 45, summary: "Local market that sets up only on dates ending in 3 or 8; during the conference, that is Tuesday 23 March. Produce, street snacks, fish and tangerines.", tags: ["walkable", "souvenirs"], skipPlanner: true },
  { id: "yakcheonsa", name: "Yakcheonsa Temple", nameKo: "약천사", category: "culture", lat: 33.2462, lng: 126.4494, durationMin: 60, summary: "Large Buddhist temple above the sea in Daepo-dong, 5 minutes by taxi from ICC. The main hall (1996) houses a 4.5 m Vairocana Buddha. Free entry; temple stays can be booked.", tags: ["photo"] },
  { id: "daepo-port", name: "Daepo Port", nameKo: "대포포구", category: "sight", lat: 33.2388, lng: 126.4358, durationMin: 30, summary: "Small fishing harbour just east of the Jusangjeolli cliffs, on Olle Route 8, with seafood restaurants nearby. Jet-boat and parasailing trips leave from here in good weather.", tags: ["walkable", "sunset"] },
  { id: "jungmun-town", name: "Jungmun town centre", nameKo: "중문 시내 (중문환승정류장 일대)", category: "food", lat: 33.2518, lng: 126.4238, durationMin: 60, summary: "The local town above the resort, around the Jungmun transfer bus stop: everyday Korean restaurants, cafés, convenience stores and pharmacies, cheaper than the hotels. About 15 minutes' walk from ICC.", tags: ["walkable", "evening", "accessible"] },
  { id: "yerae-park", name: "Yerae Ecological Park", nameKo: "예래생태공원", category: "nature", lat: 33.2444, lng: 126.391, durationMin: 45, march: "Cherry trees and canola line the stream in spring.", summary: "Flat path along the Yerae stream just west of the resort, a quiet walk among village fields. Free.", tags: ["family", "photo"] },
  { id: "nonjitmul", name: "Nonjitmul", nameKo: "논짓물", category: "nature", lat: 33.2368, lng: 126.3887, durationMin: 30, summary: "Spot on the Yerae coast where spring water runs into the sea, walled into pools that locals swim in during summer. A pleasant stop on Olle Route 8 the rest of the year.", tags: ["photo"] },
  { id: "eongtto", name: "Eongtto Falls", nameKo: "엉또폭포", category: "nature", lat: 33.2685, lng: 126.5, durationMin: 30, summary: "Cliff in a forested gorge that becomes a 50 m waterfall only after heavy rain (roughly 70 mm or more in the hills). Dry most days, so go right after a big storm.", tags: ["photo"], skipPlanner: true },
  { id: "gangjeong-cheon", name: "Gangjeong Stream", nameKo: "강정천", category: "nature", lat: 33.2357, lng: 126.4762, durationMin: 40, summary: "One of the few Jeju streams with clear water all year, running through pools and small falls to the sea. Olle Route 7 crosses its mouth.", tags: ["photo"] },
  { id: "beophwan", name: "Beophwan Port", nameKo: "법환포구", category: "sight", lat: 33.2372, lng: 126.5161, durationMin: 40, summary: "Haenyeo diving village facing Beomseom island, on Olle Route 7. Good for a coastal walk toward Oedolgae and a seafood meal.", tags: ["haenyeo", "sunset", "photo"] },

  // Near Jungmun
  { id: "gunsan-oreum", name: "Gunsan Oreum", nameKo: "군산오름", category: "nature", lat: 33.2552, lng: 126.3683, durationMin: 45, summary: "Volcanic cone you can drive almost to the top; a short walk then gives views from Hallasan to Sanbangsan, Mara-do and the Jungmun coast. A sunrise favourite.", tags: ["oreum", "sunrise", "photo"] },
  { id: "baksugijeong", name: "Baksugijeong Cliff & Daepyeong Port", nameKo: "박수기정·대평포구", category: "sight", lat: 33.2372, lng: 126.3587, durationMin: 45, summary: "A 100 m sheer sea cliff above the small Daepyeong harbour, best seen from the pebble shore at sunset. Olle Route 9 starts here and climbs over the top.", tags: ["geology", "sunset", "photo"] },
  { id: "andeok-valley", name: "Andeok Valley", nameKo: "안덕계곡", category: "nature", lat: 33.2573, lng: 126.3525, durationMin: 40, summary: "Stream between basalt walls in an evergreen forest, with a short path along the water. Free and rarely crowded.", tags: ["geology"] },
  { id: "hwasun-gotjawal", name: "Hwasun Gotjawal", nameKo: "화순곶자왈 생태탐방숲길", category: "nature", lat: 33.2635, lng: 126.3324, durationMin: 50, summary: "Gotjawal is Jeju's forest on broken lava, where northern and southern plants grow side by side. Gentle scoria paths, a 30–40 minute loop and a lookout to Sanbangsan. Free.", tags: ["geology", "family"] },
  { id: "bangju-church", name: "Bangju Church", nameKo: "방주교회", category: "culture", lat: 33.3051, lng: 126.3878, durationMin: 30, summary: "Itami Jun's \"ark\" church, a timber-and-metal hull floating on a shallow pool. Visitors are welcome outside service times.", tags: ["photo"] },
  { id: "aerospace-museum", name: "Jeju Aerospace Museum", nameKo: "제주항공우주박물관", category: "culture", lat: 33.303, lng: 126.2989, durationMin: 120, indoor: true, summary: "Large museum of aviation and space science, with aircraft in the main hall and galleries on astronomy and space exploration. 25 minutes by car.", tags: ["science", "family", "accessible"] },
  { id: "shinhwa-park", name: "Shinhwa Theme Park", nameKo: "신화테마파크", category: "culture", lat: 33.3059, lng: 126.3122, durationMin: 180, summary: "Amusement park at the Jeju Shinhwa World resort, open into the evening. The children's choice for a day off.", tags: ["family", "evening"] },
  { id: "wetland-1100", name: "1100 Highland Wetland", nameKo: "1100고지습지", category: "nature", lat: 33.3399, lng: 126.4368, durationMin: 40, summary: "Ramsar-listed mountain wetland at 1,100 m on the road over Hallasan, with a 20–30 minute boardwalk loop. Bus 240 from ICC stops at the rest area. It is much colder than the coast, and snow is possible in March.", tags: ["wetland", "drive"] },
  { id: "seogwipo-forest", name: "Seogwipo Natural Recreation Forest", nameKo: "서귀포자연휴양림", category: "nature", lat: 33.3108, lng: 126.4631, durationMin: 90, summary: "Forest on the 1100 Road with walking loops and a forest-bath trail, 20 minutes up from Jungmun. Small entry fee.", tags: ["family", "hiking"] },
  { id: "camellia-hill", name: "Camellia Hill", nameKo: "카멜리아힐", category: "nature", lat: 33.2896, lng: 126.3699, durationMin: 75, march: "The late camellia varieties are usually still in flower in March.", summary: "Camellia arboretum with hundreds of varieties and garden paths, 15 minutes by car from Jungmun.", tags: ["family", "photo"] },

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
  { id: "peace-park", name: "Jeju 4·3 Peace Park", nameKo: "제주4·3평화공원", category: "culture", lat: 33.4498, lng: 126.6178, durationMin: 90, indoor: true, summary: "Memorial and museum for the Jeju 4·3 tragedy (1947–54), essential for understanding the island's modern history.", tags: ["accessible"] },

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
    blurb: "Basalt columns, the beach, a canola valley and a waterfall gorge, all without a car.",
    stops: ["jusangjeolli", "olle8", "saekdal", "eongdeongmul", "cheonjeyeon", "beritnae"],
  },
  {
    id: "jungmun-rain",
    title: "Jungmun on a rainy day",
    length: "3 h · on foot or short taxi hops",
    blurb: "Teddy bears, a glasshouse garden and trick art, all indoors within 2 km of the venue.",
    stops: ["teddy", "yeomiji", "alive-museum"],
  },
  {
    id: "jungmun-west",
    title: "West of Jungmun: valleys and cliffs",
    length: "Half day · taxi or car",
    blurb: "A stream park, a seaside spring, an oreum with a view, a 100 m sea cliff and a forest gorge, all within 10 km.",
    stops: ["yerae-park", "nonjitmul", "gunsan-oreum", "baksugijeong", "andeok-valley"],
  },
  {
    id: "jungmun-east",
    title: "East along the coast to Beophwan",
    length: "Half day · taxi, or Olle 7–8 on foot",
    blurb: "A fishing harbour, a seaside temple, a clear stream and a haenyeo village facing Beomseom.",
    stops: ["daepo-port", "yakcheonsa", "gangjeong-cheon", "beophwan"],
  },
  {
    id: "road-1100",
    title: "Up the 1100 Road",
    length: "3 h · car, or bus 240 for the wetland",
    blurb: "From subtropical coast to mountain wetland in 30 minutes: a forest walk and a boardwalk at 1,100 m.",
    stops: ["seogwipo-forest", "wetland-1100"],
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
