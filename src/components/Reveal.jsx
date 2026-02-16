import React from "react";
import useScrollReveal from "../hooks/useScrollReveal";

/**
 * Wrap any content in <Reveal> to fade-in + slide-up on scroll.
 *
 * Props:
 *  - delay  (number)  extra delay in ms (default 0)
 *  - className (string) extra classes to merge
 *  - as (string) HTML tag to render (default "div")
 */
const Reveal = ({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  ...rest
}) => {
  const ref = useScrollReveal({ delay });
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
