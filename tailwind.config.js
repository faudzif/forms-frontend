/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/views/**/*.{js,pug}"],
	theme: {
		extend: {
			colors: {
				green: "#0c7560",
				lightGreen: "#91c44d",
				red: "red"
			},
			rotate: {
				'y-180': 'rotateY(180deg)',
			}
		},
		container: {
			center: true,
		},
	},
	safelist: [
		'w-[28px]', '!w-[28px]', '!rounded-[8px]', '!mx-[2px]'
	],
	plugins: [],
};
