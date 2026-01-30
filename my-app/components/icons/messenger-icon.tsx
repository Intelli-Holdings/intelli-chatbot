import React from "react";

interface MessengerIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const MessengerIcon: React.FC<MessengerIconProps> = ({ className, ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className} {...props}>
      <image
        href="/Messenger_logo.png"
        x="0"
        y="0"
        width="512"
        height="512"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
};
