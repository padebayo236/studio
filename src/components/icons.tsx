import type { SVGProps } from "react";

export const AgriProLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 22c1.25-.98 2.5-1.99 2.5-3.5-1.25-1.52-2.5-3-2.5-5 2.5-2 5-4 5-8.5 2.5 4.5 5 6.5 5 8.5C12.5 14 10 16 7.5 17.5c0 1.5.83 2.19 2.5 3.5" />
    <path d="M22 22c-1.25-.98-2.5-1.99-2.5-3.5 1.25-1.52 2.5-3 2.5-5-2.5-2-5-4-5-8.5C14.5 9.5 12 11.5 12 13.5c2.5 1 5 3 5 4 .41 1.5-1.25 2.48-2.5 3.5" />
  </svg>
);
