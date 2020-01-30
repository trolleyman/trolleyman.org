
use std::path::{Path, PathBuf};
use std::process::Command;
use std::ffi::OsString;

use clap::{Arg, App, SubCommand};


const XTASK_PRINT: &'static str = "\x1B[1m\x1B[32m       xtask\x1B[0m ";

fn main() {
	let mut app = App::new("trolleyman-org-xtask")
		.version("0.1.0")
		.about("Build runner for the trolleyman-org project")
		.author("Callum Tolley")
		.subcommand(SubCommand::with_name("build")
			.about("Builds the project")
			.arg(Arg::with_name("release")
				.long("release")
				.help("Build artifacts in release mode, with optimizations")))
		.subcommand(SubCommand::with_name("run")
			.about("Runs the project locally")
			.arg(Arg::with_name("release")
				.long("release")
				.help("Build artifacts in release mode, with optimizations")))
		.subcommand(SubCommand::with_name("dist")
			.about("Packages the release for distribution in the target/dist directory"));

	let matches = app.clone().get_matches();

	if let Some(matches) = matches.subcommand_matches("build") {
		run_cargo("build", matches.is_present("release"), project_root().join("tanks"), true);
		run_cargo("build", matches.is_present("release"), project_root(), false);
	} else if let Some(_matches) = matches.subcommand_matches("run") {
		run_cargo("build", matches.is_present("release"), project_root().join("tanks"), true);
		run_cargo("run", matches.is_present("release"), project_root(), false);
	} else {
		app.print_help().expect("Failed to print help");
	}
}

fn run_cargo(subcommand: &str, release: bool, dir: impl AsRef<Path>, tanks: bool) {
	let dir = dir.as_ref();
	let mut args: Vec<&str> = Vec::new();
	args.push(subcommand);

	if tanks {
		args.push("--target=wasm32-unknown-unknown")
	}

	if release {
		args.push("--release");
		if tanks {
			args.push("--no-default-features");
			args.push("--features=wee_alloc");
		}
	}
	println!("{}cargo {} ({})", XTASK_PRINT, args.join(" "), dir.display());

	let status = Command::new(&cargo_exe())
		.args(&args)
		.current_dir(dir)
		.status();
	if !status.map(|status| status.success()).unwrap_or(false) {
		std::process::exit(1);
	}
	
	if tanks {
		let from = dir.join("target").join("wasm32-unknown-unknown").join(if release { "release" } else { "debug" }).join("tanks.wasm");
		let to = project_root().join("static").join("wasm").join("tanks").join("tanks.wasm");
		run_copy(&from, &to);
	}
}

fn run_copy(from: impl AsRef<Path>, to: impl AsRef<Path>) {
	let from = from.as_ref();
	let to = to.as_ref();
	
	if let Some(base) = common_path(from, to) {
		match (from.strip_prefix(&base), to.strip_prefix(&base)) {
			(Ok(from_strip), Ok(to_strip)) => println!("{}copy {}{}{{{},{}}}", XTASK_PRINT, base.display(), std::path::MAIN_SEPARATOR, from_strip.display(), to_strip.display()),
			_ => println!("{}copy '{}' to '{}'", XTASK_PRINT, from.display(), to.display()),
		}
	} else {
		println!("{}copy '{}' to '{}'", XTASK_PRINT, from.display(), to.display());
	}
	
	std::fs::copy(from, to)
		.expect("\x1B[31mFailed to copy file\x1B[0m");
}

fn cargo_exe() -> OsString {
	std::env::var_os("CARGO")
		.unwrap_or_else(|| OsString::from("cargo"))
}

fn project_root() -> PathBuf {
	Path::new(&env!("CARGO_MANIFEST_DIR"))
		.ancestors()
		.nth(1)
		.unwrap()
		.to_path_buf()
}

fn common_path<A: AsRef<Path>, B: AsRef<Path>>(a: A, b: B) -> Option<PathBuf> {
	let a = a.as_ref().components();
	let b = b.as_ref().components();
	let mut ret = PathBuf::new();
	let mut found = false;
	for (one, two) in a.zip(b) {
		if one == two {
			ret.push(one);
			found = true;
		} else {
			break;
		}
	}
	if found {
		Some(ret)
	} else {
		None
	}
}
