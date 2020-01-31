
use std::path::{Path, PathBuf};
use std::process::Command;
use std::ffi::OsString;

use structopt::StructOpt;
use clap::{Arg, App, SubCommand};


const XTASK_PRINT: &'static str = "\x1B[1m\x1B[32m       xtask\x1B[0m ";
const ERROR_PRINT: &'static str = "\x1B[1m\x1B[31merror\x1B[37m:\x1B[0m ";

fn main() {
	let mut app = App::new("trolleyman-org-xtask")
		.version("0.1.0")
		.about("Build runner for the trolleyman-org project")
		.author("Callum Tolley")
		.subcommand(SubCommand::with_name("build")
			.about("Compile the project")
			.arg(Arg::with_name("release")
				.long("release")
				.help("Build artifacts in release mode, with optimizations")))
		.subcommand(SubCommand::with_name("run")
			.about("Run the server locally")
			.arg(Arg::with_name("release")
				.long("release")
				.help("Build artifacts in release mode, with optimizations")))
		.subcommand(SubCommand::with_name("dist")
			.about("Package the release for distribution in the target/dist directory"))
		.subcommand(SubCommand::with_name("clean")
			.about("Remove the target directories")
			.arg(Arg::with_name("all")
				.log("all")
				.help("Remove the xtask target directory")));

	let matches = app.clone().get_matches();

	if let Some(matches) = matches.subcommand_matches("build") {
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"));
		run_cargo("build", matches.is_present("release"), project_root());
	} else if let Some(matches) = matches.subcommand_matches("run") {
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"));
		run_cargo("run", matches.is_present("release"), project_root());
	} else if let Some(_) = matches.subcommand_matches("dist") {
		run_wasm_pack(true, project_root().join("tanks"));
		run_cargo("build", true, project_root());
		run_copy_dir(project_root().join("static"), dist_dir().join("static"));
	} else if let Some(matches) = matches.subcommand_matches("clean") {
		let mut rets = vec![
			run_rmdir(project_root().join("target"), false),
			run_rmdir(project_root().join("tanks").join("target"), false),
			run_rmdir(project_root().join("static").join("wasm").join("tanks").join("pkg"), false),
		];
		if matches.is_present("all") {
			rets.push(run_rmdir(project_root().join("xtask").join("target"), false));
		}
		if rets.iter().any(|r| r.is_err()) {
			std::process::exit(1);
		}
	} else {
		eprintln!("{}no subcommand specified", ERROR_PRINT);
		app.print_help().expect("Failed to print help");
	}
}

fn run_wasm_pack(release: bool, dir: impl AsRef<Path>) {
	let dir = dir.as_ref();

	let args: Vec<OsString> = if release {
		vec!["wasm-pack".into(), "build".into(), "--release".into(), "--target=web".into(), dir.into(), "--".into(), "--no-default-features".into(), "--features=wee_alloc".into()]
	} else {
		vec!["wasm-pack".into(), "build".into(), "--dev".into(), "--target=web".into(), dir.into()]
	};
	
	eprintln!("{}{}", XTASK_PRINT, args.iter().map(|s| s.to_string_lossy().to_owned()).collect::<Vec<_>>().join(" "));
	
	let command = wasm_pack::command::Command::from_iter(&args);
	if let Err(e) = wasm_pack::command::run_wasm_pack(command) {
		eprintln!("{}failed to run wasm-pack: {}", ERROR_PRINT, e);
		std::process::exit(1);
	}

	let from = dir.join("pkg");
	let to = project_root().join("static").join("wasm").join("tanks").join("pkg");
	run_copy_dir(from, to);
}

fn run_cargo(subcommand: &str, release: bool, dir: impl AsRef<Path>) {
	let dir = dir.as_ref();
	let mut args: Vec<&str> = Vec::new();
	args.push(subcommand);

	if release {
		args.push("--release");
	}
	eprintln!("{}cargo {} ({})", XTASK_PRINT, args.join(" "), dir.display());

	let status = Command::new(&cargo_exe())
		.args(&args)
		.current_dir(dir)
		.status();
	if !status.map(|status| status.success()).unwrap_or(false) {
		std::process::exit(1);
	}
}

fn run_copy_dir(from: impl AsRef<Path>, to: impl AsRef<Path>) {
	let from = from.as_ref();
	let to = to.as_ref();

	if let Some(base) = common_path(from, to) {
		match (from.strip_prefix(&base), to.strip_prefix(&base)) {
			(Ok(from_strip), Ok(to_strip)) => println!("{}copy directory {}{}{{{} -> {}}}", XTASK_PRINT, base.display(), std::path::MAIN_SEPARATOR, from_strip.display(), to_strip.display()),
			_ => eprintln!("{}copy directory {} -> {}", XTASK_PRINT, from.display(), to.display()),
		}
	} else {
		eprintln!("{}copy directory {} -> {}", XTASK_PRINT, from.display(), to.display());
	}

	if let Err(e) = fs_extra::dir::copy(from, to, &fs_extra::dir::CopyOptions {
		overwrite: true,
		copy_inside: true,
		..fs_extra::dir::CopyOptions::new()
	}) {
		eprintln!("{}failed to copy directory: {}", ERROR_PRINT, e);
		std::process::exit(1);
	}
}

fn run_rmdir(dir: impl AsRef<Path>, error_fail: bool) -> Result<(), ()> {
	let dir = dir.as_ref();
	eprintln!("{}delete directory {}", XTASK_PRINT, dir.display());
	if let Err(e) = fs_extra::dir::remove(dir) {
		eprintln!("{}failed to delete directory: {}", ERROR_PRINT, e);
		if error_fail {
			std::process::exit(1);
		}
		Err(())
	} else {
		Ok(())
	}
}

fn cargo_exe() -> OsString {
	std::env::var_os("CARGO")
		.unwrap_or_else(|| OsString::from("cargo"))
}

fn dist_dir() -> PathBuf {
	project_root().join("target").join("dist")
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
