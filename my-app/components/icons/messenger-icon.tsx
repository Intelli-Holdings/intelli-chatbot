import React from "react";

interface MessengerIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const MessengerIcon: React.FC<MessengerIconProps> = ({ className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.34.27.55l.05 1.78a.8.8 0 0 0 1.12.71l1.99-.88a.8.8 0 0 1 .53-.04c.91.25 1.88.38 2.9.38 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.16.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.62L8.94 9.9a1.5 1.5 0 0 1 2.16-.4l2.34 1.75c.21.16.5.16.72 0l3.16-2.4c.42-.32.97.18.68.62z" />
    </svg>
  );
};
