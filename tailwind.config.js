module.exports = {
  purge: [
    './pages/**/*.tsx',
    './components/**/*.tsx',
  ],
  theme: {},
  variants: {},
  plugins: [],
  // darkMode: 'media',
}


/* 每当你将NODE_ENV设置为生产环境时，Tailwind都会自动清除CSS中未使用的样式 
   https://tailwindcss.com/docs/optimizing-for-production#removing-unused-css
*/