import * as React from "react";

// Simplified drop-in for the original Wix-backed <Image>. Renders a plain <img>
// and maps the fittingType prop to object-fit. Works with data URLs and any URL.
const Image = React.forwardRef(({ src, fittingType = "fill", className = "", alt = "", ...props }, ref) => {
  const fit = fittingType === "cover" || fittingType === "fill" ? "object-cover" : fittingType === "contain" ? "object-contain" : "object-cover";
  if (!src) {
    return <div ref={ref} className={`bg-[#f7f1e6] ${className}`} {...props} />;
  }
  return <img ref={ref} src={src} alt={alt} className={`${fit} ${className}`} {...props} />;
});
Image.displayName = "Image";

export { Image };
export default Image;
