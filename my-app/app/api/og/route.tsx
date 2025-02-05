import { ImageResponse } from 'next/og';
import { Inter } from 'next/font/google';
// App router includes @vercel/og.
// No need to install it.
 
export async function GET() {
  return new ImageResponse(
    (
        <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundImage: 'linear-gradient(to bottom, #dbf4ff, #fff1f1)',
          fontSize: 100,
          letterSpacing: -2,
          fontWeight: 700,
          textAlign: 'center',
          
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 44.86 51.21"
          width="80"
          height="80"
          fill="#007fFF"
        >
          <g id="Layer_1-2" data-name="Layer 1">
          <g>
            <g>
              <path className="cls-1" d="m19.25,40.86c.56-2.94,1.33-3.7,4.26-4.26.35-.07.56-.35.56-.7s-.21-.63-.56-.7c-2.94-.56-3.7-1.33-4.26-4.26-.07-.35-.35-.56-.7-.56s-.63.21-.7.56c-.56,2.94-1.33,3.7-4.26,4.26-.28.07-.56.35-.56.7s.21.63.56.7c2.94.56,3.7,1.33,4.26,4.26.07.35.35.56.7.56s.63-.28.7-.56Z"/>
              <path className="cls-1" d="m31.27,38.76c-1.54-.28-1.89-.63-2.17-2.17-.07-.35-.35-.56-.7-.56s-.63.21-.7.56c-.28,1.54-.63,1.89-2.17,2.17-.35.07-.56.35-.56.7s.21.63.56.7c1.54.28,1.89.63,2.17,2.17.07.35.35.56.7.56s.63-.21.7-.56c.28-1.54.63-1.89,2.17-2.17.35-.07.56-.35.56-.7s-.21-.63-.56-.7Z"/>
            </g>
            <path className="cls-1" d="m44.86,24.58v6.99c0,2.41-1.71,4.42-3.97,4.89l-.04.04c.02,1.45-.22,5.09-2.86,8.03-2.31,2.57-5.85,3.92-10.51,4.02l-.05.04c-.71,1.83-2.69,3.04-4.87,2.47-1.37-.36-2.49-1.46-2.85-2.83-.66-2.49.98-4.77,3.26-5.15.22-.04.44-.06.67-.06.13,0,.27,0,.4.02,1.98.19,3.54,1.82,3.66,3.84l.06.06c4.04-.14,7.09-1.3,9.04-3.48,2.25-2.5,2.46-5.67,2.45-6.9l-.04-.04c-2.44-.33-4.33-2.42-4.33-4.95v-6.99c0-1.59.75-3.01,1.91-3.92,1.47-1.16,2.32-2.92,2.08-4.77-.36-2.88-1.37-6.64-3.99-9.55-2.83-3.14-7.02-4.73-12.45-4.73s-9.62,1.59-12.45,4.73c-2.63,2.91-3.63,6.67-3.99,9.55-.23,1.86.61,3.62,2.08,4.77,1.16.91,1.91,2.33,1.91,3.92v6.81c0,2.39-1.6,4.6-3.94,5.08-3.2.66-6.03-1.79-6.03-4.89v-6.99c0-1.69.84-3.18,2.13-4.09s2.02-2.23,2.14-3.74c.26-3.2,1.25-7.87,4.52-11.49C11.93,1.77,16.52,0,22.43,0s10.5,1.77,13.65,5.27c3.27,3.63,4.26,8.29,4.52,11.49.12,1.5.91,2.87,2.14,3.74s2.13,2.4,2.13,4.09Z"/>
          </g>
        </g>
        </svg>
        <div
          style={{
            backgroundImage: 'linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Effortless
        </div>
        <div
          style={{
            backgroundImage: 'linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Customer
        </div>
        <div
          style={{
            backgroundImage: 'linear-gradient(90deg, rgb(255, 77, 77), rgb(249, 203, 40))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Support
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}