import { useEffect, useRef } from "react";

/**
 * Intersection-Observer–based scroll reveal.
 *
 * Returns a ref — attach it to any element and it will fade-in + slide-up
 * when it enters the viewport.
 *
 * @param {Object}  opts
 * @param {number}  opts.threshold  – 0-1, how much of the element must be visible (default 0.15)
 * @param {string}  opts.rootMargin – observer root margin (default "0px 0px -60px 0px")
 * @param {number}  opts.delay      – extra delay in ms before the animation starts (default 0)
 */
export default function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
  delay = 0,
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // initial hidden state
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.unobserve(el); // animate once
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, delay]);

  return ref;
}
