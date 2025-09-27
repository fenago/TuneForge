module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        tuneforge: {
          'blue-violet': '#8A2BE2',
          'indigo': '#4B0082',
          'dark-slate-blue': '#483D8B',
          'slate-blue': '#6A5ACD',
          'medium-slate-blue': '#7B68EE',
          'medium-purple': '#9370DB',
          'dark-blue': '#1a202c',
          'medium-gray': '#718096',
          'light-gray': '#f7fafc',
        }
      },
      backgroundImage: {
        'tuneforge-gradient': 'linear-gradient(to right, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB)',
        'tuneforge-gradient-reverse': 'linear-gradient(to left, #8A2BE2, #4B0082, #483D8B, #6A5ACD, #7B68EE, #9370DB)',
        gradient:
          "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'dm-serif': ['DM Serif Display', 'serif'],
      },
      animation: {
        opacity: "opacity 0.25s ease-in-out",
        appearFromRight: "appearFromRight 300ms ease-in-out",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        popup: "popup 0.25s ease-in-out",
        shimmer: "shimmer 3s ease-out infinite alternate",
        bounce: "bounce 1s infinite",
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideDown: "slideDown 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      animationDelay: {
        '500': '500ms',
        '1000': '1000ms',
        '1500': '1500ms',
        '2000': '2000ms',
        '2500': '2500ms',
        '3000': '3000ms',
        '4000': '4000ms',
      },
      keyframes: {
        opacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        appearFromRight: {
          "0%": { opacity: 0.3, transform: "translate(15%, 0px);" },
          "100%": { opacity: 1, transform: "translate(0);" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 20%, 80%, 100%": {
            transform: "rotate(0deg)",
          },
          "30%, 60%": {
            transform: "rotate(-2deg)",
          },
          "40%, 70%": {
            transform: "rotate(2deg)",
          },
          "45%": {
            transform: "rotate(-4deg)",
          },
          "55%": {
            transform: "rotate(4deg)",
          },
        },
        popup: {
          "0%": { transform: "scale(0.8)", opacity: 0.8 },
          "50%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "0 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-1000': {
          'animation-delay': '1000ms',
        },
        '.animation-delay-2000': {
          'animation-delay': '2000ms',
        },
        '.animation-delay-3000': {
          'animation-delay': '3000ms',
        },
        '.animation-delay-4000': {
          'animation-delay': '4000ms',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  daisyui: {
    // Light & dark themes are added by default (it switches automatically based on OS settings)
    // You can add another theme among the list of 30+
    // Add "data-theme='theme_name" to any HTML tag to enable the 'theme_name' theme.
    // https://daisyui.com/
    themes: ["light", "dark"],
  },
};
