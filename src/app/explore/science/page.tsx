import type { Metadata } from "next";
import Link from "next/link";
import { GuideHeader } from "@/components/GuideNav";
import { PlacesMap } from "@/components/map/PlacesMap";
import { MoonGlyph } from "@/components/MoonGlyph";
import { ICC } from "@/lib/geo";
import { CONFERENCE_DAYS, formatClock, moonLabel, moonPhase, sunTimes } from "@/lib/sky";

export const metadata: Metadata = {
  title: "Physicist's trail",
  description: "Jeju's volcanic physics, observatories and the night sky during Quark Matter 2027.",
};

const STOPS = [
  {
    id: "jusangjeolli",
    title: "Columnar jointing",
    physics:
      "A thick lava flow cools from its surfaces inward. Thermal contraction opens cracks that meet at roughly 120°, the arrangement that releases strain most efficiently, so hexagonal columns grow perpendicular to the cooling front.",
  },
  {
    id: "seongsan",
    title: "Surtseyan eruption",
    physics:
      "About 5,000 years ago magma met seawater in shallow water. Steam explosions shattered it into fine ash that settled into the steep tuff cone you climb today. It is the same mechanism observed live at Surtsey in 1963.",
  },
  {
    id: "suwolbong",
    title: "Hydrovolcanic layers & bomb sags",
    physics:
      "Base surges deposited thin layers of ash. Ballistic blocks thrown out by the explosions hit the wet layers and bent them downward: frozen impact craters with a recorded trajectory.",
  },
  {
    id: "manjanggul",
    title: "Lava tube",
    physics:
      "Low-viscosity pāhoehoe lava crusted over on top while molten lava kept flowing underneath, then drained away and left a 7.4 km tunnel. Look for flow lines on the walls and a 7.6 m lava column.",
  },
  {
    id: "sanbangsan",
    title: "Trachyte lava dome",
    physics:
      "Viscous, silica-rich lava piled up around the vent instead of flowing, building a 395 m bell-shaped dome about 0.8 Myr ago, one of the oldest landforms on the island.",
  },
  {
    id: "yeongsil",
    title: "Shield volcano",
    physics:
      "Hallasan's gentle profile reflects many fluid basaltic flows. The Yeongsil trail passes a ring of eroded spires (Obaek Nahan) on its way up.",
  },
];

const OBSERVATORIES = [
  { id: "astro-seogwipo", note: "Public telescope sessions in the evening; reservation may be needed." },
];

export default function SciencePage() {
  const nights = CONFERENCE_DAYS.map(({ y, m, d }) => {
    // Phase at 21:00 KST that evening.
    const { age, illumination } = moonPhase(new Date(Date.UTC(y, m - 1, d, 12)));
    const { sunset } = sunTimes(y, m, d, ICC.lat, ICC.lng);
    return { d, age, illumination, sunset, name: moonLabel(age) };
  });
  const darkNights = nights.filter((n) => n.illumination < 0.35).map((n) => n.d);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <GuideHeader kicker="For the curious physicist" title="The physicist's trail">
        Jeju is a volcanic island, a UNESCO World Natural Heritage site and a Global Geopark. Each stop below is
        explained in terms of the physics behind it, from sea level to 1,950 m.
      </GuideHeader>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <ol className="space-y-3">
          {STOPS.map((s, i) => (
            <li key={s.id} className="rounded-md border border-border bg-surface p-4 sm:p-5">
              <div className="flex items-baseline gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sea text-sm font-semibold text-on-sea">{i + 1}</span>
                <div>
                  <h2 className="font-semibold">{s.title}</h2>
                  <Link href={`/explore/?place=${s.id}`} className="text-sm text-sea underline">Show on map</Link>
                </div>
              </div>
              <p className="mt-2 leading-relaxed">{s.physics}</p>
            </li>
          ))}
        </ol>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="h-72 overflow-hidden rounded-md border border-border sm:h-96">
            <PlacesMap ids={[...STOPS.map((s) => s.id), ...OBSERVATORIES.map((o) => o.id)]} />
          </div>

          <section className="rounded-md border border-border bg-surface p-4">
            <h2 className="font-semibold">Night sky during QM2027</h2>
            <ul className="mt-3 grid grid-cols-4 gap-2 text-center text-sm sm:grid-cols-7 lg:grid-cols-4">
              {nights.map((n) => (
                <li key={n.d} className="rounded-md bg-background p-2">
                  <p className="text-xs text-muted">Mar {n.d}</p>
                  <MoonGlyph age={n.age} className="mx-auto my-1 size-7" label={n.name} />
                  <p className="text-xs tabular-nums">{Math.round(n.illumination * 100)}%</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              {darkNights.length
                ? `Darkest evenings: March ${darkNights.join(", ")}.`
                : "The moon is bright all week, so plan on bright targets (planets, the moon itself)."}{" "}
              Sunset is around {formatClock(nights[0].sunset)}.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <b className="text-foreground">Look for Canopus.</b> At latitude 33°N, Jeju is one of the few
              places in Korea where α Carinae clears the southern horizon. Look low in the south after dusk, from
              the Seogwipo coast.
            </p>
            <p className="mt-3 text-sm text-muted">
              Observatory: Seogwipo Astronomical Science Center. {OBSERVATORIES[0].note}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
