import { useEffect, useState, useCallback } from "react";
import {
  Heart, Wallet, Briefcase, Brain, Users, Sparkles,
  ChevronLeft, ChevronRight, Download, Mail, ArrowRight,
  Activity, TrendingUp, Shield, Zap, Target, Layers,
} from "lucide-react";

// Discovery brand accents
const C = {
  bg: "#0B0D12",
  panel: "#11141B",
  slate: "#1A1F2B",
  line: "rgba(255,255,255,0.08)",
  health: "#22C55E",   // Vitality green
  bank: "#2F80ED",     // Discovery blue
  hnw: "#A78BFA",      // High-net-worth purple
  gold: "#E8C36A",
  text: "#F4F5F7",
  mute: "#8B92A4",
};

function Chrome({ idx, total, title }: { idx: number; total: number; title: string }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-10 py-6 print:px-12 print:py-8">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-md" style={{ background: `linear-gradient(135deg, ${C.health}, ${C.bank}, ${C.hnw})` }} />
        <div className="text-[13px] font-medium tracking-[0.18em] uppercase" style={{ color: C.text }}>
          LifeStack <span style={{ color: C.mute }}>×</span> Discovery
        </div>
      </div>
      <div className="text-[11px] tracking-[0.25em] uppercase" style={{ color: C.mute }}>
        {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {title}
      </div>
    </div>
  );
}

function SlideFrame({ children, idx, total, title }: any) {
  return (
    <section
      className="slide relative w-full overflow-hidden"
      style={{
        background: `radial-gradient(1200px 800px at 15% 10%, rgba(47,128,237,0.10), transparent 60%),
                     radial-gradient(1000px 700px at 90% 90%, rgba(167,139,250,0.10), transparent 60%),
                     ${C.bg}`,
        color: C.text,
        minHeight: "100vh",
      }}
    >
      <Chrome idx={idx} total={total} title={title} />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col justify-center px-10 pt-24 pb-20">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }} />
    </section>
  );
}

const Kicker = ({ children, color = C.gold }: any) => (
  <div className="mb-5 text-[11px] font-semibold tracking-[0.3em] uppercase" style={{ color }}>
    {children}
  </div>
);

const Pillar = ({ Icon, label, color }: any) => (
  <div className="flex items-center gap-2 rounded-full border px-3 py-1.5"
       style={{ borderColor: C.line, background: "rgba(255,255,255,0.02)" }}>
    <Icon size={14} style={{ color }} />
    <span className="text-[12px] tracking-wide" style={{ color: C.text }}>{label}</span>
  </div>
);

// ─────────────────────── SLIDES ───────────────────────

function Slide1() {
  return (
    <>
      <Kicker>The Magnum Opus · 2026</Kicker>
      <h1 className="font-serif text-[clamp(2.8rem,6.5vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.02em]">
        LifeStack <span style={{ color: C.mute }}>×</span> Discovery:
        <br />
        <span style={{
          background: `linear-gradient(90deg, ${C.health}, ${C.bank} 55%, ${C.hnw})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>The Future of Shared Value.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed" style={{ color: C.mute }}>
        Integrating <span style={{ color: C.text }}>intent-based data</span> into the Discovery ecosystem — the
        missing identity layer between health, wealth, and human ambition.
      </p>

      {/* 3D-ish life stack */}
      <div className="mt-14 flex items-center gap-10">
        <div className="relative h-[260px] w-[260px] flex-shrink-0">
          {[
            { y: 0, c: C.hnw, Icon: Briefcase, label: "Career" },
            { y: 60, c: C.bank, Icon: Wallet, label: "Money" },
            { y: 120, c: C.health, Icon: Heart, label: "Health" },
          ].map((s, i) => (
            <div key={i}
              className="absolute left-1/2 flex h-[88px] w-[260px] -translate-x-1/2 items-center gap-4 rounded-2xl border px-5 backdrop-blur-md"
              style={{
                top: s.y,
                borderColor: C.line,
                background: `linear-gradient(135deg, ${s.c}22, ${s.c}08)`,
                boxShadow: `0 30px 60px -30px ${s.c}80, inset 0 1px 0 rgba(255,255,255,0.05)`,
                transform: `perspective(900px) rotateX(34deg) translateZ(${i * 6}px)`,
              }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.c}33` }}>
                <s.Icon size={20} style={{ color: s.c }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.mute }}>Stack Layer</div>
                <div className="text-base font-semibold">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Pillar Icon={Heart} label="Health" color={C.health} />
            <Pillar Icon={Wallet} label="Banking" color={C.bank} />
            <Pillar Icon={Briefcase} label="Career" color={C.hnw} />
            <Pillar Icon={Brain} label="Mindset" color={C.gold} />
          </div>
          <p className="text-[15px] leading-relaxed" style={{ color: C.mute }}>
            A confidential partnership proposal prepared for <span style={{ color: C.text }}>Discovery Group</span>,
            South Africa.
          </p>
        </div>
      </div>
    </>
  );
}

function Slide2() {
  return (
    <>
      <Kicker color={C.bank}>02 · Beyond Vitality</Kicker>
      <h2 className="font-serif text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.02em]">
        The Missing Link.
      </h2>
      <p className="mt-4 max-w-2xl text-lg" style={{ color: C.mute }}>
        Discovery knows the <em style={{ color: C.text, fontStyle: "italic" }}>what</em>.
        LifeStack knows the <em style={{ color: C.gold, fontStyle: "italic" }}>why</em>.
      </p>

      <div className="mt-12 grid grid-cols-12 gap-8 items-center">
        {/* Venn */}
        <div className="col-span-12 md:col-span-6 relative h-[360px]">
          <svg viewBox="0 0 400 360" className="absolute inset-0 h-full w-full">
            <defs>
              <filter id="b"><feGaussianBlur stdDeviation="0.5" /></filter>
            </defs>
            <circle cx="140" cy="160" r="110" fill={C.health} fillOpacity="0.22" stroke={C.health} strokeOpacity="0.6" />
            <circle cx="260" cy="160" r="110" fill={C.bank} fillOpacity="0.22" stroke={C.bank} strokeOpacity="0.6" />
            <circle cx="200" cy="250" r="110" fill={C.hnw} fillOpacity="0.22" stroke={C.hnw} strokeOpacity="0.6" />
            <text x="80" y="110" fill={C.health} fontSize="13" fontWeight="600">HEALTH</text>
            <text x="290" y="110" fill={C.bank} fontSize="13" fontWeight="600">BANKING</text>
            <text x="140" y="340" fill={C.hnw} fontSize="13" fontWeight="600">LIFE TRAJECTORY</text>
            <text x="200" y="200" textAnchor="middle" fill={C.gold} fontSize="14" fontWeight="700">INTENT</text>
            <text x="200" y="218" textAnchor="middle" fill={C.text} fontSize="10" opacity="0.7">LifeStack core</text>
          </svg>
        </div>

        {/* Compare */}
        <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
          {[
            { t: "Discovery Today", c: C.bank, items: ["Transactions", "Vitality workouts", "Claims & policies", "Reactive insight"] },
            { t: "LifeStack Intent", c: C.gold, items: ["Identity goals", "Founder trajectory", "Mindset signals", "Predictive intent"] },
          ].map((col, i) => (
            <div key={i} className="rounded-2xl border p-5"
                 style={{ borderColor: C.line, background: i ? `linear-gradient(180deg, ${C.gold}10, transparent)` : C.panel }}>
              <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: col.c }}>{col.t}</div>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: C.text }}>
                {col.items.map((it) => <li key={it} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full" style={{ background: col.c }} />{it}
                </li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Slide3() {
  const Trigger = ({ Icon, label, value, color }: any) => (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3"
         style={{ borderColor: C.line, background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-3">
        <Icon size={16} style={{ color }} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs font-mono" style={{ color }}>{value}</span>
    </div>
  );
  return (
    <>
      <Kicker color={C.hnw}>03 · Domain Occupation</Kicker>
      <h2 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        Inside the Discovery ecosystem.
      </h2>

      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Money mockup — Discovery Bank */}
        <div className="col-span-12 md:col-span-5 rounded-3xl border p-6"
             style={{ borderColor: C.line, background: `linear-gradient(160deg, ${C.bank}18, ${C.panel})` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded" style={{ background: C.bank }} />
              <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.mute }}>Discovery Bank · Money</span>
            </div>
            <span className="text-[10px]" style={{ color: C.mute }}>LifeStack edition</span>
          </div>
          <div className="mt-5">
            <div className="text-[11px]" style={{ color: C.mute }}>Founder Reserve</div>
            <div className="font-mono text-3xl font-bold" style={{ color: C.text }}>R 184,210</div>
            <div className="mt-1 text-xs" style={{ color: C.health }}>↑ 12.4% intent-aligned spend</div>
          </div>
          <div className="mt-5 h-[70px] w-full">
            <svg viewBox="0 0 300 70" className="h-full w-full">
              <polyline fill="none" stroke={C.bank} strokeWidth="2"
                points="0,55 30,48 60,52 90,38 120,42 150,28 180,32 210,20 240,24 270,12 300,16" />
              <polyline fill={`${C.bank}22`} stroke="none"
                points="0,55 30,48 60,52 90,38 120,42 150,28 180,32 210,20 240,24 270,12 300,16 300,70 0,70" />
            </svg>
          </div>
        </div>

        {/* Vitality mockup */}
        <div className="col-span-12 md:col-span-4 rounded-3xl border p-6"
             style={{ borderColor: C.line, background: `linear-gradient(160deg, ${C.health}18, ${C.panel})` }}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full" style={{ background: C.health }} />
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.mute }}>Vitality · Health</span>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-[140px] w-[140px]">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="50" stroke={C.line} strokeWidth="10" fill="none" />
                <circle cx="60" cy="60" r="50" stroke={C.health} strokeWidth="10" fill="none"
                  strokeDasharray={`${0.82 * 314} 314`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] uppercase tracking-widest" style={{ color: C.mute }}>Status</div>
                <div className="text-lg font-bold" style={{ color: C.health }}>DIAMOND</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs" style={{ color: C.mute }}>
            Intent-stack rewards <span style={{ color: C.health }}>+340 pts/wk</span>
          </div>
        </div>

        {/* Trigger panel */}
        <div className="col-span-12 md:col-span-3 rounded-3xl border p-5"
             style={{ borderColor: C.line, background: C.panel }}>
          <div className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: C.mute }}>Habit → Reward</div>
          <div className="space-y-2">
            <Trigger Icon={Activity} label="Morning move" value="+25 VP" color={C.health} />
            <Trigger Icon={Brain} label="Mindset stack" value="+15 VP" color={C.gold} />
            <Trigger Icon={Wallet} label="Goal contribution" value="−0.25% APR" color={C.bank} />
            <Trigger Icon={Target} label="Founder check-in" value="+50 VP" color={C.hnw} />
          </div>
        </div>
      </div>
    </>
  );
}

function Slide4() {
  return (
    <>
      <Kicker color={C.health}>04 · Predictive Risk Modeling</Kicker>
      <h2 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        Burnout, detected <span style={{ color: C.gold }}>72 days early.</span>
      </h2>
      <p className="mt-4 max-w-2xl text-base" style={{ color: C.mute }}>
        LifeStack reads the Mindset pillar before it propagates into the Health pillar — the magnum opus of
        retention strategy.
      </p>

      <div className="mt-10 rounded-3xl border p-8" style={{ borderColor: C.line, background: C.panel }}>
        <svg viewBox="0 0 800 240" className="h-[260px] w-full">
          {/* axes */}
          <line x1="40" y1="200" x2="780" y2="200" stroke={C.line} />
          <line x1="40" y1="20" x2="40" y2="200" stroke={C.line} />
          {/* mindset (early warning) */}
          <polyline fill="none" stroke={C.gold} strokeWidth="2.5" strokeDasharray="0"
            points="40,170 120,150 200,120 280,90 360,70 440,60" />
          {/* health (lagging) */}
          <polyline fill="none" stroke={C.health} strokeWidth="2.5"
            points="40,180 120,178 200,172 280,165 360,150 440,128 520,100 600,75 680,60 760,52" />
          {/* claim event */}
          <line x1="600" y1="20" x2="600" y2="200" stroke={C.bank} strokeDasharray="4 4" opacity="0.6" />
          <circle cx="440" cy="60" r="6" fill={C.gold} />
          <circle cx="600" cy="75" r="6" fill={C.health} />
          <text x="448" y="50" fill={C.gold} fontSize="11">Mindset signal</text>
          <text x="608" y="65" fill={C.health} fontSize="11">Health claim threshold</text>
          <text x="40" y="225" fill={C.mute} fontSize="10">T−90d</text>
          <text x="760" y="225" fill={C.mute} fontSize="10" textAnchor="end">T0</text>
        </svg>

        <div className="mt-6 grid grid-cols-3 gap-6">
          {[
            { Icon: Brain, c: C.gold, k: "Mindset", v: "Leading indicator" },
            { Icon: Heart, c: C.health, k: "Health", v: "Lagging cost driver" },
            { Icon: Shield, c: C.bank, k: "Retention", v: "+18% projected" },
          ].map((s) => (
            <div key={s.k} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${s.c}22` }}>
                <s.Icon size={18} style={{ color: s.c }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest" style={{ color: C.mute }}>{s.k}</div>
                <div className="text-sm" style={{ color: C.text }}>{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Slide5() {
  return (
    <>
      <Kicker color={C.hnw}>05 · The Pilot</Kicker>
      <h2 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        Data over volume.
      </h2>
      <p className="mt-4 max-w-2xl text-base" style={{ color: C.mute }}>
        Projected insights from the Builder Phase — an anonymised cohort of 17 high-signal users on the
        Founder trajectory.
      </p>

      <div className="mt-10 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7 rounded-3xl border p-6" style={{ borderColor: C.line, background: C.panel }}>
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.mute }}>Success trajectory · 17 Builders</div>
            <div className="text-[11px]" style={{ color: C.gold }}>→ The Founder</div>
          </div>
          <svg viewBox="0 0 600 220" className="mt-4 h-[230px] w-full">
            <defs>
              <linearGradient id="grad" x1="0" x2="1">
                <stop offset="0" stopColor={C.bank} />
                <stop offset="0.6" stopColor={C.hnw} />
                <stop offset="1" stopColor={C.gold} />
              </linearGradient>
            </defs>
            <line x1="30" y1="190" x2="580" y2="190" stroke={C.line} />
            {Array.from({ length: 17 }).map((_, i) => {
              const x = 40 + i * 32;
              const h = 30 + Math.sin(i * 0.6) * 14 + i * 7;
              return <rect key={i} x={x} y={190 - h} width="14" height={h} rx="3"
                fill="url(#grad)" opacity={0.5 + i / 34} />;
            })}
            <polyline fill="none" stroke={C.gold} strokeWidth="2"
              points="46,170 78,160 110,148 142,140 174,128 206,118 238,105 270,96 302,86 334,78 366,68 398,58 430,50 462,42 494,36 526,30 558,24" />
          </svg>
        </div>

        <div className="col-span-12 md:col-span-5 space-y-4">
          {[
            { k: "Activation", v: "94%", c: C.health, sub: "Day-7 ritual adoption" },
            { k: "Identity Lift", v: "+2.3×", c: C.hnw, sub: "Founder-trait progression" },
            { k: "Mindset Signal", v: "0.81", c: C.gold, sub: "Predictive confidence" },
          ].map((s) => (
            <div key={s.k} className="flex items-center justify-between rounded-2xl border px-5 py-4"
                 style={{ borderColor: C.line, background: C.panel }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: C.mute }}>{s.k}</div>
                <div className="text-xs mt-0.5" style={{ color: C.text }}>{s.sub}</div>
              </div>
              <div className="font-mono text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Slide6() {
  const steps = [
    { Icon: Layers, c: C.bank, t: "API Integration", d: "Seamless rewards sync between LifeStack intent events and Discovery's Vitality/Bank rails." },
    { Icon: Sparkles, c: C.hnw, t: "White-labeled \u201CDiscovery Edition\u201D", d: "LifeStack rebranded as a Discovery-native identity layer for members." },
    { Icon: Users, c: C.gold, t: "Pilot — Purple & Diamond", d: "Closed launch to Discovery's highest-value members; data-rich, low-volume validation." },
  ];
  return (
    <>
      <Kicker color={C.gold}>06 · Roadmap to Integration</Kicker>
      <h2 className="font-serif text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.02em]">
        From proposal to production.
      </h2>

      <div className="mt-10 space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-5 rounded-2xl border p-6"
               style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                 style={{ background: `${s.c}22`, color: s.c }}>
              <s.Icon size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs" style={{ color: s.c }}>0{i + 1}</span>
                <h3 className="text-xl font-semibold" style={{ color: C.text }}>{s.t}</h3>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.mute }}>{s.d}</p>
            </div>
            <TrendingUp size={16} style={{ color: C.mute }} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 rounded-3xl border p-7"
           style={{ borderColor: C.line, background: `linear-gradient(135deg, ${C.bank}18, ${C.hnw}18, ${C.gold}10)` }}>
        <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.gold }}>Next step</div>
        <h3 className="font-serif text-2xl font-bold">A 30-minute conversation with the founder.</h3>
        <a
          href="mailto:founder@lifestack.app?subject=LifeStack%20%C3%97%20Discovery%20Partnership"
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition print:hidden"
          style={{ background: C.text, color: C.bg }}
        >
          <Mail size={16} /> Contact the Founder <ArrowRight size={16} />
        </a>
      </div>
    </>
  );
}

// ─────────────────────── SHELL ───────────────────────

const SLIDES = [
  { title: "Magnum Opus", C: Slide1 },
  { title: "Missing Link", C: Slide2 },
  { title: "Domain Occupation", C: Slide3 },
  { title: "Predictive Risk", C: Slide4 },
  { title: "The Pilot", C: Slide5 },
  { title: "Roadmap", C: Slide6 },
];

export default function PitchDiscovery() {
  const [i, setI] = useState(0);
  const [printMode, setPrintMode] = useState(false);

  const next = useCallback(() => setI((v) => Math.min(SLIDES.length - 1, v + 1)), []);
  const prev = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const handleDownload = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 500);
    }, 200);
  };

  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen font-sans">
      <style>{`
        .pitch-serif, .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        @media print {
          @page { size: 1600px 900px; margin: 0; }
          body { background: ${C.bg} !important; }
          .slide { page-break-after: always; break-after: page; min-height: 900px !important; height: 900px !important; }
          .no-print, .print\\:hidden { display: none !important; }
        }
      `}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap" />

      {/* Persistent controls */}
      <div className="no-print fixed right-6 top-6 z-50 flex items-center gap-2">
        <button onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold backdrop-blur-md transition hover:scale-[1.02]"
          style={{ background: C.text, color: C.bg }}>
          <Download size={14} /> Download as PDF
        </button>
      </div>

      {printMode ? (
        // Print: render all slides stacked
        SLIDES.map((S, idx) => (
          <S.C key={idx} />
        )).map((node, idx) => (
          <SlideFrame key={idx} idx={idx} total={SLIDES.length} title={SLIDES[idx].title}>
            {node}
          </SlideFrame>
        ))
      ) : (
        <SlideFrame idx={i} total={SLIDES.length} title={SLIDES[i].title}>
          {(() => { const S = SLIDES[i].C; return <S />; })()}
        </SlideFrame>
      )}

      {/* Nav */}
      {!printMode && (
        <div className="no-print fixed inset-x-0 bottom-6 z-50 flex items-center justify-center gap-3">
          <button onClick={prev} disabled={i === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md disabled:opacity-30"
            style={{ borderColor: C.line, background: "rgba(255,255,255,0.04)", color: C.text }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 rounded-full border px-4 py-2 backdrop-blur-md"
               style={{ borderColor: C.line, background: "rgba(255,255,255,0.04)" }}>
            {SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: idx === i ? 24 : 8,
                  background: idx === i ? C.gold : "rgba(255,255,255,0.25)",
                }} />
            ))}
          </div>
          <button onClick={next} disabled={i === SLIDES.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md disabled:opacity-30"
            style={{ borderColor: C.line, background: "rgba(255,255,255,0.04)", color: C.text }}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
