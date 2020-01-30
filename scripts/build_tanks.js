
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

var release = false;
if (process.argv.length === 3) {
	if (process.argv[2] === "--release") {
		release = true;
	} else {
		console.error("Usage: " + process.argv0 + " " + process.argv[1] + " [--release]");
		process.exit(1);
	}
} else if (process.argv.length > 3) {
	console.error("Usage: " + process.argv0 + " " + process.argv[1] + " [--release]");
	process.exit(1);
}
console.log("release mode: " + release);

var dir = path.dirname(path.resolve(__dirname));

var buildCmd = "wasm-pack build --target web";
if (release) {
	buildCmd += " -- --no-default-features --features=wee_alloc"
}

execSync(buildCmd, {
	"cwd": path.join(dir, "tanks"),
	"stdio": "inherit"
});

fs.copySync(path.join(dir, "tanks", "pkg"), path.join(dir, "static", "wasm", "tanks", "pkg"));
