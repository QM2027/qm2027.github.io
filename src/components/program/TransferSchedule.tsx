"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { shareLink } from "./shared";

// Moving a schedule between devices without a server: the sending device shows the schedule link
// as a QR code, the receiving one opens it (camera app) or scans it here. Scanning in the guide
// matters on iPhone: an app added to the Home Screen keeps its own storage apart from Safari, and
// the camera app always opens links in Safari.

/** The ids in a schedule link, or undefined when the text isn't one. */
export function scheduleIds(text: string): string[] | undefined {
  try {
    const url = new URL(text);
    if (url.searchParams.get("view") !== "mine" || !url.searchParams.has("ids")) return undefined;
    return (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  } catch {
    return undefined;
  }
}

function Dialog({ label, title, onClose, children }: { label: string; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:max-w-md sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="pt-2 text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** The schedule link as a QR code, plus the usual share or copy. */
export function SendDialog({ url, count, onClose }: { url: string; count: number; onClose: () => void }) {
  const [path, setPath] = useState<{ d: string; size: number }>();
  const [failed, setFailed] = useState(false);
  const [shared, setShared] = useState<string>();

  useEffect(() => {
    let live = true;
    import("qrcode-generator")
      .then(({ default: qrcode }) => {
        // Level L keeps the code as coarse as possible; a screen gives a clean, flat image.
        const qr = qrcode(0, "L");
        qr.addData(url, "Byte");
        qr.make();
        const n = qr.getModuleCount();
        let d = "";
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
        if (live) setPath({ d, size: n });
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [url]);

  async function share() {
    const result = await shareLink("My QM2027 schedule", url);
    setShared(result === "copied" ? "Link copied" : result === "shared" ? "Shared" : "Couldn't share");
  }

  return (
    <Dialog label="Send schedule to another device" title="Open on your phone" onClose={onClose}>
      <p className="mt-1 text-sm text-muted">
        Scan this with your phone&apos;s camera to open your {count} saved item{count === 1 ? "" : "s"} there.
      </p>
      {/* Always dark on white, whatever the theme: scanners expect it. */}
      <div className="mx-auto mt-4 aspect-square w-full max-w-72 rounded-md bg-white p-2">
        {path ? (
          <svg viewBox={`-4 -4 ${path.size + 8} ${path.size + 8}`} className="size-full" shapeRendering="crispEdges" role="img" aria-label="QR code of your schedule link">
            <path d={path.d} fill="#000" />
          </svg>
        ) : (
          <p className="flex size-full items-center justify-center text-center text-sm text-neutral-600">
            {failed ? "Couldn't make the code. Use the link below." : "Making the code…"}
          </p>
        )}
      </div>
      <p className="mt-4 text-sm">
        <b>Using the guide as an app on iPhone?</b> Open the app, go to Mine and tap <i>Scan a code</i>. The camera app opens links in
        Safari, which keeps a separate schedule.
      </p>
      <button onClick={share} className="mt-4 min-h-11 w-full rounded-md border border-border px-4 text-sm">
        {shared ?? "Share or copy the link instead"}
      </button>
    </Dialog>
  );
}

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorClass = { new (o: { formats: string[] }): Detector; getSupportedFormats?: () => Promise<string[]> };

/** The browser's own QR reader where there is one (Chrome on Android), else jsQR. */
async function makeReader(): Promise<(video: HTMLVideoElement) => Promise<string | undefined>> {
  const Native = (window as unknown as { BarcodeDetector?: DetectorClass }).BarcodeDetector;
  if (Native && (await Native.getSupportedFormats?.().catch((): string[] => []))?.includes("qr_code")) {
    const detector = new Native({ formats: ["qr_code"] });
    return async (video) => (await detector.detect(video))[0]?.rawValue;
  }
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  return async (video) => {
    // Scaled down: a code filling part of a 640-pixel frame reads fine and keeps each pass quick.
    const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" })?.data;
  };
}

/** Reads a schedule QR code with the camera and hands over its ids. */
export function ScanDialog({ onScan, onClose }: { onScan: (ids: string[]) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "wrong" | "blocked" | "unavailable">("starting");
  const done = useRef(onScan);
  useEffect(() => {
    done.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let live = true;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus("unavailable");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      } catch (e) {
        return live && setStatus(e instanceof DOMException && e.name === "NotAllowedError" ? "blocked" : "unavailable");
      }
      if (!live || !video.current) return stream.getTracks().forEach((t) => t.stop());
      video.current.srcObject = stream;
      await video.current.play().catch(() => {});
      const read = await makeReader().catch(() => undefined);
      if (!read) return live && setStatus("unavailable");
      if (live) setStatus("scanning");

      const tick = async () => {
        if (!live) return;
        const v = video.current;
        const text = v && v.readyState >= 2 ? await read(v).catch(() => undefined) : undefined;
        if (!live) return;
        if (text) {
          const ids = scheduleIds(text);
          if (ids) return done.current(ids);
          setStatus("wrong");
        }
        timer = setTimeout(tick, 200);
      };
      tick();
    })();

    return () => {
      live = false;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const message = {
    starting: "Starting the camera…",
    scanning: "Point the camera at the code on your other device.",
    wrong: "That code isn't a schedule link from this guide. On the other device, open Mine and tap Send to phone.",
    blocked: "Camera access is blocked for this site. Allow it in the browser or system settings, then try again.",
    unavailable: "This browser can't use the camera here. Scan the code with your phone's camera app instead.",
  }[status];

  return (
    <Dialog label="Scan a schedule code" title="Scan a schedule code" onClose={onClose}>
      <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-md bg-black">
        <video ref={video} muted playsInline className="size-full object-cover" />
        {status === "scanning" || status === "wrong" ? (
          <div className="pointer-events-none absolute inset-[15%] rounded-md border-2 border-white/80" />
        ) : null}
      </div>
      <p className={`mt-3 text-sm ${status === "wrong" || status === "blocked" ? "text-tangerine" : "text-muted"}`} aria-live="polite">
        {message}
      </p>
    </Dialog>
  );
}
