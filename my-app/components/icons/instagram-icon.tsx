import React from "react";

interface InstagramIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const InstagramIcon: React.FC<InstagramIconProps> = ({ className, ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 768" className={className} {...props}>
      <image
        href="/instagram.png"
        x="0"
        y="0"
        width="768"
        height="768"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
