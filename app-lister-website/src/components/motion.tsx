"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const EASE = [0.2, 0.75, 0.25, 1] as [number, number, number, number];

/* ------------------------------------------------ scroll feed indicator */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });
  const scaleX = useTransform(width, (v) => v);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-stamp"
    />
  );
}

/* --------------------------------------------------------- reveal block */

type Dir = "up" | "left" | "right" | "none";

export function Reveal({
  children,
  delay = 0,
  dir = "up",
  amount = 18,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  dir?: Dir;
  amount?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const offset =
    dir === "up"
      ? { y: amount }
      : dir === "left"
        ? { x: -amount }
        : dir === "right"
          ? { x: amount }
          : {};

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------- word-by-word display */

export function SplitWord({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const letters = text.split("");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className} aria-label={text}>
      {letters.map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          aria-hidden
          className="inline-block will-change-transform"
          initial={{ y: "0.5em", opacity: 0, rotateX: -55 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            duration: 0.62,
            delay: delay + i * 0.045,
            ease: EASE,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------- parallax */

export function useParallax(distance = 60): {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 24, restDelta: 0.5 });
  const still = useMotionValue(0);
  return { ref, y: reduce ? still : y };
}

/* --------------------------------------------------------- ticker strip */

export function Marquee({
  items,
  speed = 38,
  tone = "paper",
}: {
  items: string[];
  speed?: number;
  tone?: "paper" | "dark";
}) {
  const reduce = useReducedMotion();
  const dark = tone === "dark";
  const row = [...items, ...items];

  return (
    <div
      className={`relative flex overflow-hidden border-y-2 ${
        dark ? "border-paper/30 bg-ribbon" : "border-ribbon bg-bar"
      }`}
    >
      <motion.div
        className="flex shrink-0 items-center gap-8 py-2.5 pr-8"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={
          reduce
            ? undefined
            : { duration: speed, ease: "linear", repeat: Infinity }
        }
      >
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className={`label flex shrink-0 items-center gap-8 whitespace-nowrap ${
              dark ? "text-paper/70" : "text-ribbon"
            }`}
          >
            {item}
            <span className="text-stamp" aria-hidden>
              ✱
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------- press / magnet */

export function Magnetic({
  children,
  className,
  strength = 0.28,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 22 });
  const sy = useSpring(y, { stiffness: 320, damping: 22 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;

  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      style={reduce ? undefined : { transform }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------ tilt plate */

export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 260, damping: 20 });
  const sry = useSpring(ry, { stiffness: 260, damping: 20 });

  return (
    <motion.div
      className={className}
      style={
        reduce
          ? undefined
          : {
              rotateX: srx,
              rotateY: sry,
              transformPerspective: 900,
              transformStyle: "preserve-3d",
            }
      }
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------- counting digits */

export function Count({
  to,
  duration = 900,
  className,
  format = (n: number) => n.toLocaleString("en-US"),
}: {
  to: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [seen, setSeen] = useState(false);
  const from = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setSeen(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen || reduce) return;
    let frame = 0;
    const start = performance.now();
    const begin = from.current;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(begin + (to - begin) * eased);
      from.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(reduce || !seen ? (reduce ? to : 0) : value)}
    </span>
  );
}

/* ------------------------------------------------- drawn-on svg polyline */

export function DrawPath({
  d,
  stroke,
  strokeWidth = 2.2,
  delay = 0,
}: {
  d: string;
  stroke: string;
  strokeWidth?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, delay, ease: "easeInOut" }}
    />
  );
}
