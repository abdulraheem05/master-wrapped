// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Creates the utility class: font-display
        'display': ['Akira-Expanded', 'sans-serif'],
        
        // Creates the utility class: font-body
        'body': ['Roboto', 'sans-serif'], 
        
        // You can add as many as you need
        // 'heading': ['Open-Sans', 'sans-serif'],
      }
    },
  },
  // ... other config
}