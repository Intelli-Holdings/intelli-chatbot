import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    './node_modules/onborda/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/nextstepjs/dist/**/*.{js,ts,jsx,tsx}'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "var(--space-xl, 2rem)",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ── Golden Ratio Spacing Scale ────────────────── */
      spacing: {
        'golden-3xs': 'var(--space-3xs)',   // 2px
        'golden-2xs': 'var(--space-2xs)',   // 3px
        'golden-xs': 'var(--space-xs)',     // 5px
        'golden-sm': 'var(--space-sm)',     // 8px
        'golden-md': 'var(--space-md)',     // 13px
        'golden-lg': 'var(--space-lg)',     // 21px
        'golden-xl': 'var(--space-xl)',     // 34px
        'golden-2xl': 'var(--space-2xl)',   // 55px
        'golden-3xl': 'var(--space-3xl)',   // 89px
      },
      /* ── Golden Ratio Typography Scale ─────────────── */
      fontSize: {
        'golden-caption': ['var(--text-caption)', { lineHeight: 'var(--leading-tight)' }],
        'golden-label': ['var(--text-label)', { lineHeight: 'var(--leading-normal)' }],
        'golden-body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--leading-golden)' }],
        'golden-body': ['var(--text-body)', { lineHeight: 'var(--leading-golden)' }],
        'golden-subheading': ['var(--text-subheading)', { lineHeight: 'var(--leading-normal)' }],
        'golden-heading': ['var(--text-heading)', { lineHeight: 'var(--leading-tight)' }],
        'golden-display': ['var(--text-display)', { lineHeight: '1.1' }],
        'golden-display-lg': ['var(--text-display-lg)', { lineHeight: '1.05' }],
        'golden-hero': ['var(--text-hero)', { lineHeight: '1' }],
      },
      /* ── Line Heights ──────────────────────────────── */
      lineHeight: {
        'golden': 'var(--leading-golden)',   // 1.618 — the golden ratio
        'golden-tight': 'var(--leading-tight)',
        'golden-normal': 'var(--leading-normal)',
      },
      /* ── Letter Spacing ────────────────────────────── */
      letterSpacing: {
        'golden-tight': 'var(--tracking-tight)',
        'golden-normal': 'var(--tracking-normal)',
        'golden-wide': 'var(--tracking-wide)',
        'golden-wider': 'var(--tracking-wider)',
      },
      /* ── Layout ────────────────────────────────────── */
      maxWidth: {
        'golden-content': 'var(--content-max)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        dreamBlue: "#007fff",
        sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			'color-1': 'hsl(var(--color-1))',
  			'color-2': 'hsl(var(--color-2))',
  			'color-3': 'hsl(var(--color-3))',
  			'color-4': 'hsl(var(--color-4))',
  			'color-5': 'hsl(var(--color-5))',
  			'color-6': 'hsl(var(--color-6))',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'squircle-xs': 'var(--radius-xs)',    // 6px  — badges, chips
        'squircle-sm': 'var(--radius-sm)',    // 8px  — buttons, inputs
        'squircle-md': 'var(--radius-md)',    // 12px — cards, dropdowns
        'squircle-lg': 'var(--radius-lg)',    // 16px — dialogs, panels
        'squircle-xl': 'var(--radius-xl)',    // 20px — large containers
        'squircle-2xl': 'var(--radius-2xl)', // 24px — hero sections
        // Legacy aliases (shadcn compat)
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      keyframes: {
        meteor: {
  				'0%': {
  					transform: 'rotate(215deg) translateX(0)',
  					opacity: '1'
  				},
  				'70%': {
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'rotate(215deg) translateX(-500px)',
  					opacity: '0'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - var(--gap)))'
  				}
  			},
  			'marquee-vertical': {
  				from: {
  					transform: 'translateY(0)'
  				},
  				to: {
  					transform: 'translateY(calc(-100% - var(--gap)))'
  				}
  			},
  			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'caret-blink': {
  				'0%,70%,100%': {
  					opacity: '1'
  				},
  				'20%,50%': {
  					opacity: '0'
  				}
  			},
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-light": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        'logo-cloud': {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(calc(-100% - 4rem))'
  				}
  			},
  			'skew-scroll': {
  				'0%': {
  					transform: 'rotatex(20deg) rotateZ(-20deg) skewX(20deg) translateZ(0) translateY(0)'
  				},
  				'100%': {
  					transform: 'rotatex(20deg) rotateZ(-20deg) skewX(20deg) translateZ(0) translateY(-100%)'
  				}
  			},
			shimmer: {
				'0%, 90%, 100%': {
					'background-position': 'calc(-200% - var(--shimmer-width)) 0'
				},
				'30%, 60%': {
					'background-position': 'calc(100% + var(--shimmer-width)) 0'
				}
			},
  			pulse: {
  				'0%, 100%': {
  					boxShadow: '0 0 10px 2px rgba(199, 232, 247, 0.6)'
  				},
  				'50%': {
  					boxShadow: '0 0 15px 5px rgba(56, 189, 248, 0.8)'
  				}
  			},
  			orbit: {
  				'0%': {
  					transform: 'rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)'
  				}
  			},
  			grid: {
  				'0%': {
  					transform: 'translateY(-50%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			rainbow: {
  				'0%': {
  					'background-position': '0%'
  				},
  				'100%': {
  					'background-position': '200%'
  				}
  			},
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow-blue': {
          '0%, 100%': { boxShadow: '0 0 20px 0 rgba(0,127,255,0.15)' },
          '50%': { boxShadow: '0 0 40px 8px rgba(0,127,255,0.3)' },
        },
      },
	  animation: {
		meteor: 'meteor 5s linear infinite',
			marquee: 'marquee var(--duration) linear infinite',
			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'logo-cloud': 'logo-cloud 30s linear infinite',
			'skew-scroll': 'skew-scroll 20s linear infinite',
			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
			shimmer: 'shimmer 8s infinite',
			pulse: 'pulse 2s infinite',
			orbit: 'orbit calc(var(--duration)*1s) linear infinite',
			grid: 'grid 15s linear infinite',
			rainbow: 'rainbow var(--speed, 2s) infinite linear',
		float: "float 6s ease-in-out infinite",
		"pulse-light": "pulse-light 4s ease-in-out infinite",
    'fade-in-up': 'fade-in-up 0.8s ease forwards',
    'pulse-glow-blue': 'pulse-glow-blue 4s ease-in-out infinite',
	  },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

