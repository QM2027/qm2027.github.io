// Preview switches read from the query string before the first paint, so pages never flash:
//   ?edition=app | guide   the conference-app edition (preview) or the visitor guide (default)
//   ?notice=off | on       hide or show the "Not fully developed" bar
//   ?look=plain | brand | default  a design variant under discussion (see LOOKS), or the current design
// They set attributes on <html> (data-edition="app", data-notice="off", data-look="plain") that CSS
// acts on (.guide-only, .app-only, .dev-notice and the plain: variant in globals.css), and are
// remembered: in a browser tab in localStorage, inside a frame in window.name. A frame never reads
// localStorage, so the frames of public/compare.html, named "qm2027:edition=app" and so on, keep
// their own settings while navigating.

const PREFIX = "qm2027:";
const KEY = "qm2027:prefs";

/**
 * Design variants besides the current one ("default", which sets no attribute).
 * plain: the tells of generated design taken out (tracked-caps labels, eyebrows above headings,
 * template punctuation, a ticking countdown, cards nested in cards).
 * brand: plain, plus the logo's blue as the accent and Plex Sans headings in place of the serif.
 * Whichever look wins, the others' classes and rules get deleted.
 */
export const LOOKS = ["plain", "brand"] as const;
export type Look = "default" | (typeof LOOKS)[number];

export const PREFS_SCRIPT = `(function(){try{var d=document.documentElement,w=window,top=w.top===w,P=${JSON.stringify(PREFIX)},K=${JSON.stringify(KEY)},L=${JSON.stringify(LOOKS)},framed=w.name.indexOf(P)===0||!top,saved="";if(w.name.indexOf(P)===0)saved=w.name.slice(P.length);else if(top){try{saved=localStorage.getItem(K)||""}catch(_){}}var s=new URLSearchParams(saved),q=new URLSearchParams(location.search),changed=false,e=q.get("edition"),n=q.get("notice"),l=q.get("look");if(e==="app"||e==="guide"){e==="app"?s.set("edition","app"):s.delete("edition");changed=true}if(n==="off"||n==="on"){n==="off"?s.set("notice","off"):s.delete("notice");changed=true}if(l==="default"||L.indexOf(l)>=0){l==="default"?s.delete("look"):s.set("look",l);changed=true}if(s.get("edition")==="app")d.setAttribute("data-edition","app");if(s.get("notice")==="off")d.setAttribute("data-notice","off");if(L.indexOf(s.get("look"))>=0)d.setAttribute("data-look",s.get("look"));w.__qmPrefs=s.toString();if(changed){var v=s.toString();if(framed)w.name=P+v;else{try{v?localStorage.setItem(K,v):localStorage.removeItem(K)}catch(_){}}}}catch(_){}})()`;
