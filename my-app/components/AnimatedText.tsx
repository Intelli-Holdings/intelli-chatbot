import React from 'react';

type AnimatedTextProps = {
  text: string;
  duration?: number; // Duration for the animation (in ms)
};

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, duration = 2000 }) => {
  const characters = text.split("");
  const total = characters.length;

  return (
    <span className="inline-block">
      {characters.map((char, index) => (
        <span
          key={index}
          style={{
            "--index": index,
            "--total": total,
            "--duration": `${duration}ms`,
          } as React.CSSProperties}
          className="char inline-block"
        >
          {char === " " ? "\u00A0" : char} {/* Replace spaces with non-breaking spaces */}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;
