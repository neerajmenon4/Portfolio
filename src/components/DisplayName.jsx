"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const containerStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  backgroundColor: "transparent",
  color: "inherit",
  fontWeight: "bolder",
  pointerEvents: "none", // allow clicks to pass through to controls if overlaid
  gap: "8px", // Add some space between NEERAJ and MENON
};

const textStyle = {
  fontSize: "clamp(16px, 3vw, 24px)",
  position: "relative",
  whiteSpace: "nowrap",
  fontFamily: "'Doto', system-ui, sans-serif",
  fontWeight: 1000,
  color: "inherit",
  overflow: "hidden",
  lineHeight: 1,
};

export default function DisplayName() {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const timelinesRef = useRef([]);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    // slide in
    const slideIn = gsap.timeline();
    slideIn.fromTo(
      left,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 2.5 }
    );
    slideIn.fromTo(
      right,
      { x: "100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 2.5 },
      "<"
    );
    timelinesRef.current.push(slideIn);

    const randomFlicker = (el) => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(el, {
        opacity: 0.5,
        duration: Math.random() * 0.1 + 0.05,
        ease: "power1.inOut",
      });
      tl.to(el, {
        opacity: 1,
        duration: Math.random() * 0.1 + 0.05,
        ease: "power1.inOut",
      });
      tl.duration(Math.random() * 2 + 1);
      return tl;
    };

    const letters = [...left.children, ...right.children];
    letters.forEach((span) => {
      timelinesRef.current.push(randomFlicker(span));
    });

    return () => {
      timelinesRef.current.forEach((tl) => tl.kill());
      timelinesRef.current = [];
    };
  }, []);

  return (
    <div style={containerStyle}>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed&family=Doto:wght@100..900&display=swap"
        rel="stylesheet"
      />
      <div ref={leftRef} style={textStyle}>
        {Array.from("NEERAJ").map((letter, i) => (
          <span key={`l-${i}`}>{letter}</span>
        ))}
      </div>
      <div ref={rightRef} style={textStyle}>
        {Array.from("MENON").map((letter, i) => (
          <span key={`r-${i}`}>{letter}</span>
        ))}
      </div>
    </div>
  );
}
