/** Jeju International Airport (CJU) to ICC Jeju, by road. */
export const AIRPORT_KM = 45;

// Fares and times follow the Indico venue page (INDICO_VENUE), which takes precedence. No rental
// car option: renting is hard for many foreign visitors (permit rules), so the guide doesn't suggest it.
export const AIRPORT_OPTIONS = [
  {
    title: "Airport Limousine Bus 600",
    time: "≈ 60 min",
    cost: "≈ ₩4,500",
    best: "Best value",
    steps: [
      "Exit arrivals (1F) and find the Limousine 600 stop; buses run 06:00–21:25, every 16–40 min",
      "Pay by T-money card or credit card on boarding",
      "Get off at “ICC Jeju” (or the stop for your Jungmun hotel)",
    ],
  },
  {
    title: "Taxi",
    time: "≈ 50 min",
    cost: "≈ ₩35,000–50,000",
    best: "Door to door",
    steps: [
      "Use the taxi rank outside arrivals, or book with the Kakao T app",
      "Show the driver the Korean card below",
      "Most taxis accept foreign credit cards",
    ],
  },
];
