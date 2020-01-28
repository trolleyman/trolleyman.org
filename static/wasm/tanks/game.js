import init, { main } from './pkg/tanks.js';

async function run() {
	await init();
	
	main();
}

run();
