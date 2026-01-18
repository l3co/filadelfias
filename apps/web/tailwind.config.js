/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mint: {
                    50: '#DEEFE7',
                },
                navy: {
                    900: '#002333',
                },
                teal: {
                    500: '#159A9C',
                },
            },
        },
    },
    plugins: [],
}
