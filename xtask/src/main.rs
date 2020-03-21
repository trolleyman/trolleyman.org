use std::{
	ffi::OsString,
	path::{Path, PathBuf},
	process::Command,
};

use clap::{App, AppSettings, Arg, SubCommand};
use structopt::StructOpt;

const XTASK_PREFIX: &'static str = "\x1B[1m\x1B[92m       xtask\x1B[0m ";
const ERROR_PREFIX: &'static str = "\x1B[1m\x1B[91merror\x1B[37m:\x1B[0m ";
const HELP_PREFIX: &'static str = "\x1B[1m\x1B[96mhelp \x1B[37m:\x1B[0m ";

fn main() {
	use std::io::Write;
	let ret = run();
	std::io::stdout().flush().ok();
	std::io::stderr().flush().ok();
	match ret {
		Err(code) if code != 0 => std::process::exit(code),
		Err(_) => std::process::exit(1),
		_ => {}
	}
}

fn run() -> Result<(), i32> {
	let app = App::new("trolleyman-org-xtask")
		.setting(AppSettings::ColoredHelp)
		.setting(AppSettings::GlobalVersion)
		.setting(AppSettings::SubcommandRequiredElseHelp)
		.setting(AppSettings::VersionlessSubcommands)
		.version("0.1.0")
		.about("Build runner for the trolleyman-org project")
		.author("Callum Tolley")
		.subcommand(
			SubCommand::with_name("generate")
				.setting(AppSettings::SubcommandRequiredElseHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Generates source files")
				.subcommand(SubCommand::with_name("grpc").about("Generate Python gRPC bindings")),
		)
		.subcommand(
			SubCommand::with_name("build")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Compile the project")
				.arg(
					Arg::with_name("release")
						.long("release")
						.help("Build artifacts in release mode, with optimizations"),
				),
		)
		.subcommand(
			SubCommand::with_name("run")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Run the server locally")
				.arg(
					Arg::with_name("release")
						.long("release")
						.help("Build artifacts in release mode, with optimizations"),
				),
		)
		.subcommand(
			SubCommand::with_name("dist")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Package the release for distribution in the target/dist directory"),
		)
		.subcommand(
			SubCommand::with_name("clean")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Remove the target directories")
				.arg(Arg::with_name("all").long("all").help("Remove the xtask target directory")),
		);

	let matches = app.clone().get_matches();

	if let Some(matches) = matches.subcommand_matches("generate") {
		if let Some(_) = matches.subcommand_matches("grpc") {
			println!("{}generate Python gRPC bindings", XTASK_PREFIX);
			run_python_version()?;
			run_python_grpc_version()?;
			run_python_grpc_compile()?;
			Ok(())
		} else {
			Err(1)
		}
	} else if let Some(matches) = matches.subcommand_matches("build") {
		println!("{}build", XTASK_PREFIX);
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"));
		run_cargo("build", matches.is_present("release"), project_root());
		Ok(())
	} else if let Some(matches) = matches.subcommand_matches("run") {
		println!("{}run", XTASK_PREFIX);
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"));
		run_cargo("run", matches.is_present("release"), project_root());
		Ok(())
	} else if let Some(_) = matches.subcommand_matches("dist") {
		println!("{}dist", XTASK_PREFIX);
		// Run normal build process
		run_wasm_pack(true, project_root().join("tanks"));
		run_cargo("build", true, project_root());

		// Copy files to target/dist
		run_rmdir(dist_dir(), true).unwrap();
		run_copy_dir(project_root().join("static"), dist_dir().join("static"));
		run_copy_dir(project_root().join("templates"), dist_dir().join("templates"));
		run_copy_exe(dist_dir());
		run_copy_file(project_root().join("config_dev.toml"), dist_dir().join("config_dev.toml"));
		run_copy_file(project_root().join("config_release.toml"), dist_dir().join("config_release.toml"));
		Ok(())
	} else if let Some(matches) = matches.subcommand_matches("clean") {
		println!("{}clean", XTASK_PREFIX);
		let mut rets = vec![
			run_rmdir(project_root().join("target"), false),
			run_rmdir(project_root().join("tanks").join("target"), false),
			run_rmdir(project_root().join("static").join("wasm").join("tanks").join("pkg"), false),
		];
		if matches.is_present("all") {
			rets.push(run_rmdir(project_root().join("xtask").join("target"), false));
		}
		if rets.iter().any(|r| r.is_err()) {
			Err(1)
		} else {
			Ok(())
		}
	} else {
		Err(1)
	}
}

fn run_python_version() -> Result<(), i32> {
	println!("{}run `python --version`", XTASK_PREFIX);
	match Command::new("python").arg("--version").output() {
		Ok(out) if !out.status.success() => {
			if let Some(code) = out.status.code() {
				eprintln!("{}`python --version` returned a non-zero exit code ({})", ERROR_PREFIX, code);
				eprintln!("{}Python may not be installed: install via. https://python.org/downloads", HELP_PREFIX);
			} else {
				eprintln!("{}`python --version` was terminated by a signal", ERROR_PREFIX);
			}
			Err(1)
		}
		Err(e) => {
			eprintln!("{}`python --version` encountered an error: {}", ERROR_PREFIX, e);
			Err(1)
		}
		_ => Ok(()),
	}
}

fn run_python_grpc_version() -> Result<(), i32> {
	let python_rpc_command = "python -m grpc_tools.protoc --version";
	println!("{}run `{}`", XTASK_PREFIX, python_rpc_command);
	match Command::new("python")
		.current_dir(project_root())
		.arg("-m")
		.arg("grpc_tools.protoc")
		.arg("--version")
		.output()
	{
		Ok(out) if !out.status.success() => {
			if let Some(code) = out.status.code() {
				eprintln!("{}`{}` returned a non-zero exit code ({})", ERROR_PREFIX, python_rpc_command, code);
				eprintln!("{}grpc_tools may not be installed: install with `pip install grpc_tools`", HELP_PREFIX);
			} else {
				eprintln!("{}`{}` was terminated by a signal", ERROR_PREFIX, python_rpc_command);
			}
			Err(1)
		}
		Err(e) => {
			eprintln!("{}`{}` encountered an error: {}", ERROR_PREFIX, python_rpc_command, e);
			Err(1)
		}
		_ => Ok(()),
	}
}

fn run_python_grpc_compile() -> Result<(), i32> {
	let python_rpc_command = "python -m grpc_tools.protoc --proto_path=facebook_grpc --python_out=facebook_grpc --grpc_python_out=facebook_grpc facebook_grpc/proto/facebook_grpc.proto";
	println!("{}run `{}`", XTASK_PREFIX, python_rpc_command);
	match Command::new("python")
		.current_dir(project_root())
		.arg("-m")
		.arg("grpc_tools.protoc")
		.arg("--proto_path=facebook_grpc")
		.arg("--python_out=facebook_grpc")
		.arg("--grpc_python_out=facebook_grpc")
		.arg("facebook_grpc/proto/facebook_grpc.proto")
		.output()
	{
		Ok(out) if !out.status.success() => {
			if let Some(code) = out.status.code() {
				eprintln!("{}`{}` returned a non-zero exit code ({})", ERROR_PREFIX, python_rpc_command, code);
			} else {
				eprintln!("{}`{}` was terminated by a signal", ERROR_PREFIX, python_rpc_command);
			}
			let stdout = String::from_utf8_lossy(&out.stdout).to_owned();
			let stderr = String::from_utf8_lossy(&out.stderr).to_owned();
			if stdout.len() > 0 {
				eprintln!("{}--- stdout ---\n{}", ERROR_PREFIX, stdout);
			}
			if stderr.len() > 0 {
				eprintln!("{}--- stderr ---\n{}", ERROR_PREFIX, stderr);
			}
			Err(1)
		}
		Err(e) => {
			eprintln!("{}`{}` encountered an error: {}", ERROR_PREFIX, python_rpc_command, e);
			Err(1)
		}
		_ => Ok(()),
	}
}

fn run_wasm_pack(release: bool, dir: impl AsRef<Path>) {
	let dir = dir.as_ref();

	let args: Vec<OsString> = if release {
		vec![
			"wasm-pack".into(),
			"build".into(),
			"--release".into(),
			"--target=web".into(),
			dir.into(),
			"--".into(),
			"--no-default-features".into(),
			"--features=wee_alloc".into(),
		]
	} else {
		vec!["wasm-pack".into(), "build".into(), "--dev".into(), "--target=web".into(), dir.into()]
	};

	println!("{}{}", XTASK_PREFIX, args.iter().map(|s| s.to_string_lossy().to_owned()).collect::<Vec<_>>().join(" "));

	let command = wasm_pack::command::Command::from_iter(&args);
	if let Err(e) = wasm_pack::command::run_wasm_pack(command) {
		eprintln!("{}failed to run wasm-pack: {}", ERROR_PREFIX, e);
		std::process::exit(1);
	}

	let from = dir.join("pkg");
	let to = project_root().join("static").join("wasm").join("tanks").join("pkg");
	run_rmdir(&to, true).unwrap();
	run_copy_dir(&from, &to);
}

fn run_cargo(subcommand: &str, release: bool, dir: impl AsRef<Path>) {
	let dir = dir.as_ref();
	let mut args: Vec<&str> = Vec::new();
	args.push(subcommand);

	if release {
		args.push("--release");
	}
	println!("{}cargo {} ({})", XTASK_PREFIX, args.join(" "), dir.display());

	let status = Command::new(&cargo_exe()).args(&args).current_dir(dir).status();
	if !status.map(|status| status.success()).unwrap_or(false) {
		std::process::exit(1);
	}
}

fn run_copy_exe(dir: impl AsRef<Path>) {
	let dir = dir.as_ref();
	let exe_name = format!("trolleyman-org{}", std::env::consts::EXE_SUFFIX);
	run_copy_file(project_root().join("target").join("release").join(&exe_name), dir.join(&exe_name));
}

fn run_copy_file(from: impl AsRef<Path>, to: impl AsRef<Path>) {
	let from = from.as_ref();
	let to = to.as_ref();

	if let Some(base) = common_path(from, to) {
		match (from.strip_prefix(&base), to.strip_prefix(&base)) {
			(Ok(from_strip), Ok(to_strip)) => println!(
				"{}copy file {}{}{{{} -> {}}}",
				XTASK_PREFIX,
				base.display(),
				std::path::MAIN_SEPARATOR,
				from_strip.display(),
				to_strip.display()
			),
			_ => println!("{}copy file {} -> {}", XTASK_PREFIX, from.display(), to.display()),
		}
	} else {
		println!("{}copy file {} -> {}", XTASK_PREFIX, from.display(), to.display());
	}

	if let Err(e) = fs_extra::file::copy(from, to, &fs_extra::file::CopyOptions {
		overwrite: true,
		..fs_extra::file::CopyOptions::new()
	}) {
		eprintln!("{}failed to copy file: {}", ERROR_PREFIX, e);
		std::process::exit(1);
	}
}

fn run_copy_dir(from: impl AsRef<Path>, to: impl AsRef<Path>) {
	let from = from.as_ref();
	let to = to.as_ref();

	if let Some(base) = common_path(from, to) {
		match (from.strip_prefix(&base), to.strip_prefix(&base)) {
			(Ok(from_strip), Ok(to_strip)) => eprintln!(
				"{}copy directory {}{}{{{} -> {}}}",
				XTASK_PREFIX,
				base.display(),
				std::path::MAIN_SEPARATOR,
				from_strip.display(),
				to_strip.display()
			),
			_ => println!("{}copy directory {} -> {}", XTASK_PREFIX, from.display(), to.display()),
		}
	} else {
		println!("{}copy directory {} -> {}", XTASK_PREFIX, from.display(), to.display());
	}

	if let Err(e) = fs_extra::dir::copy(from, to, &fs_extra::dir::CopyOptions {
		overwrite: true,
		copy_inside: true,
		..fs_extra::dir::CopyOptions::new()
	}) {
		eprintln!("{}failed to copy directory: {}", ERROR_PREFIX, e);
		std::process::exit(1);
	}
}

fn run_rmdir(dir: impl AsRef<Path>, error_fail: bool) -> Result<(), ()> {
	let dir = dir.as_ref();
	println!("{}delete directory {}", XTASK_PREFIX, dir.display());
	if let Err(e) = fs_extra::dir::remove(dir) {
		eprintln!("{}failed to delete directory: {}", ERROR_PREFIX, e);
		if error_fail {
			std::process::exit(1);
		}
		Err(())
	} else {
		Ok(())
	}
}

fn cargo_exe() -> OsString { std::env::var_os("CARGO").unwrap_or_else(|| OsString::from("cargo")) }

fn dist_dir() -> PathBuf { project_root().join("target").join("dist") }

fn project_root() -> PathBuf { Path::new(&env!("CARGO_MANIFEST_DIR")).ancestors().nth(1).unwrap().to_path_buf() }

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
