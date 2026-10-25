"use client";

import { motion } from "framer-motion";
import { useParallax } from "./motion";

export default function Plate() {
  const { ref, y } = useParallax(42);

  return (
    <figure
      ref={ref}
      className="relative border-y-2 border-ribbon bg-paper-deep"
    >
      <div className="relative h-[32vh] max-h-[420px] min-h-[220px] w-full overflow-hidden">
        <motion.img
          style={{ y }}
          src="images/printout.jpg"
          alt="A folded stack of green-bar continuous-form printout on a steel desk beside a red pencil"
          className="absolute inset-x-0 -top-12 h-[calc(100%+6rem)] w-full object-cover object-[62%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/55 to-transparent sm:via-paper/30" />
        <figcaption className="absolute inset-y-0 left-0 flex max-w-[52ch] flex-col justify-center px-4 sm:px-8">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="label text-stamp"
          >
            FIG. 1 — PLATE
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-2 font-display text-[clamp(1.05rem,2.3vw,1.7rem)] font-bold uppercase leading-[1.05] tracking-tight text-ribbon"
          >
            A lister’s output: one continuous run, folded to fit, nothing
            withheld.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="label mt-2 text-graphite"
          >
            EVERY APP ON YOUR PHONE · ONE BEAUTIFUL LIST
          </motion.p>
        </figcaption>
      </div>
    </figure>
  );
}
