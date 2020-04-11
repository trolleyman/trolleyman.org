use std::{
	ffi::OsString,
	fmt::Write,
	path::{Path, PathBuf},
	process::{Command, ExitStatus},
};

use anyhow::{anyhow, bail, Context, Result};
use clap::{App, AppSettings, Arg, SubCommand};
use structopt::StructOpt;

const XTASK_PREFIX: &'static str = "\x1B[1m\x1B[92m       xtask\x1B[0m ";
const ERROR_PREFIX: &'static str = "\x1B[1m\x1B[91merror\x1B[37m:\x1B[0m ";
const HELP_PREFIX: &'static str = "\x1B[1m\x1B[96mhelp \x1B[37m:\x1B[0m ";

fn main() {
	fn submain() -> i32 {
		use std::io::Write;
		let ret = run();
		std::io::stdout().flush().ok();
		std::io::stderr().flush().ok();
		if let Err(e) = ret {
			let msg = format!("{}", e);
			let chain = e.chain();
			if msg.len() == 0 && chain.len() == 0 {
				return 1;
			}
			eprintln!("{}{}", ERROR_PREFIX, msg);
			if chain.len() > 0 {
				eprintln!("\nCaused by:");
				for suberror in chain {
					eprintln!(" - {}", suberror);
				}
			}
			1
		} else {
			0
		}
	}
	std::process::exit(submain());
}

fn run() -> Result<()> {
	let authors_string = env!("CARGO_PKG_AUTHORS").split(';').collect::<Vec<_>>().join(", ");
	let app = App::new(clap::crate_name!())
		.version(clap::crate_version!())
		.about(clap::crate_description!())
		.author(authors_string.as_ref())
		.setting(AppSettings::ColoredHelp)
		.setting(AppSettings::GlobalVersion)
		.setting(AppSettings::SubcommandRequiredElseHelp)
		.setting(AppSettings::VersionlessSubcommands)
		.subcommand(
			SubCommand::with_name("generate")
				.setting(AppSettings::ColoredHelp)
				.setting(AppSettings::SubcommandRequiredElseHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Generates source files")
				.subcommand(SubCommand::with_name("grpc").about("Generate Python gRPC bindings")),
		)
		.subcommand(
			SubCommand::with_name("build")
				.setting(AppSettings::ColoredHelp)
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
				.setting(AppSettings::ColoredHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Run the server locally")
				.arg(
					Arg::with_name("release")
						.long("release")
						.help("Build artifacts in release mode, with optimizations"),
				),
		)
		.subcommand(
			SubCommand::with_name("watch")
				.setting(AppSettings::ColoredHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Run the server locally, and restart if files change")
				.arg(
					Arg::with_name("release")
						.long("release")
						.help("Build artifacts in release mode, with optimizations"),
				),
		)
		.subcommand(
			SubCommand::with_name("dist")
				.setting(AppSettings::ColoredHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Package the release for distribution in the target/dist directory"),
		)
		.subcommand(
			SubCommand::with_name("clean")
				.setting(AppSettings::ColoredHelp)
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
			run_protoc_version()?;
			run_tonic_build()?;
			Ok(())
		} else {
			bail!("unknown subcommand");
		}
	} else if let Some(matches) = matches.subcommand_matches("build") {
		println!("{}build", XTASK_PREFIX);
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"))?;
		run_cargo("build", matches.is_present("release"), project_root())
	} else if let Some(matches) = matches.subcommand_matches("run") {
		println!("{}run", XTASK_PREFIX);
		run_wasm_pack(matches.is_present("release"), project_root().join("tanks"))?;
		run_cargo("run", matches.is_present("release"), project_root())
	} else if let Some(matches) = matches.subcommand_matches("watch") {
		println!("{}watch", XTASK_PREFIX);
		run_cargo_watch(matches.is_present("release"), project_root())
	} else if let Some(_) = matches.subcommand_matches("dist") {
		println!("{}dist", XTASK_PREFIX);
		// Run normal build process
		run_wasm_pack(true, project_root().join("tanks"))?;
		run_cargo("build", true, project_root())?;

		// Copy files to target/dist
		run_rmdir(dist_dir())?;
		run_copy_dir(project_root().join("static"), dist_dir().join("static"))?;
		run_copy_dir(project_root().join("templates"), dist_dir().join("templates"))?;
		run_copy_exe(dist_dir())?;
		run_copy_file(project_root().join("config_dev.toml"), dist_dir().join("config_dev.toml"))?;
		run_copy_file(project_root().join("config_release.toml"), dist_dir().join("config_release.toml"))?;
		Ok(())
	} else if let Some(matches) = matches.subcommand_matches("clean") {
		println!("{}clean", XTASK_PREFIX);
		let mut rets = vec![
			run_rmdir(project_root().join("target")),
			run_rmdir(project_root().join("tanks").join("target")),
			run_rmdir(project_root().join("static").join("wasm").join("tanks").join("pkg")),
		];
		if matches.is_present("all") {
			rets.push(run_rmdir(project_root().join("xtask").join("target")));
		}
		rets.into_iter().find(|r| r.is_err()).unwrap_or(Ok(()))
	} else {
		bail!("unknown subcommand");
	}
}

fn run_command(
	command: &str,
	args: &[&str],
	dir: impl AsRef<Path>,
	help: Option<&str>,
	capture_output: bool,
) -> Result<ExitStatus> {
	let dir = dir.as_ref();
	let debug_command = format!("{} {}", command, args.join(" "));
	println!(
		"{}run `{}`{}",
		XTASK_PREFIX,
		debug_command,
		if dir == Path::new(".") { "".into() } else { format!(" ({})", dir.display()) }
	);
	let mut command = Command::new(command);
	command.current_dir(dir);
	for arg in args {
		command.arg(arg);
	}

	let (out, status) = if capture_output {
		let out = command.output().with_context(|| format!("`{}` encountered an error", debug_command))?;
		let status = out.status;
		(Some(out), status)
	} else {
		(None, command.status().with_context(|| format!("`{}` encountered an error", debug_command))?)
	};
	if !status.success() {
		let mut ret = if let Some(code) = status.code() {
			let mut ret = format!("`{}` returned a non-zero exit code ({})", debug_command, code);
			if let Some(help) = &help {
				write!(&mut ret, "\n{}{}", HELP_PREFIX, help).ok();
			}
			ret
		} else {
			format!("`{}` was terminated by a signal", debug_command)
		};
		if let Some(out) = out {
			let stdout = String::from_utf8_lossy(&out.stdout).to_owned();
			let stderr = String::from_utf8_lossy(&out.stderr).to_owned();
			if stdout.len() > 0 {
				writeln!(&mut ret, "\n--- stdout ---\n{}\n", stdout.trim_end()).ok();
			}
			if stderr.len() > 0 {
				writeln!(&mut ret, "\n--- stderr ---\n{}\n", stderr.trim_end()).ok();
			}
		}
		bail!("{}", ret)
	}
	Ok(status)
}

fn run_python_version() -> Result<()> {
	run_command(
		"python",
		&["--version"],
		".",
		"Python may not be installed: install via. https://python.org/downloads".into(),
		false,
	)
	.map(|_| ())
}

fn run_python_grpc_version() -> Result<()> {
	run_command(
		"python",
		&["-m", "grpc_tools.protoc", "--version"],
		".",
		"grpc_tools may not be installed: install with `pip install grpc_tools`".into(),
		false,
	)
	.map(|_| ())
}

fn run_python_grpc_compile() -> Result<()> {
	run_command(
		"python",
		&[
			"-m",
			"grpc_tools.protoc",
			"--proto_path=facebook_grpc",
			"--python_out=facebook_grpc",
			"--grpc_python_out=facebook_grpc",
			"facebook_grpc/proto/facebook.proto",
		],
		project_root(),
		None,
		false,
	)
	.map(|_| ())
}

fn run_protoc_version() -> Result<()> {
	run_command(
		"protoc",
		&["--version"],
		".",
		"`protoc` can not be found. Please install via. https://github.com/protocolbuffers/protobuf#protocol-compiler-installation".into(),
		false,
	)
	.map(|_| ())
}

fn is_rustfmt_installed() -> bool {
	run_command("rustfmt", &["--version"], ".", None, false).is_ok()
}

fn run_tonic_build() -> Result<()> {
	let is_rustfmt_installed = is_rustfmt_installed();
	let out_dir = project_root().join("src").join("grpc").join("gen");
	let name = "facebook";
	let proto_file = project_root().join("facebook_grpc").join("proto").join(format!("{}.proto", name));
	println!("{}tonic build ({})", XTASK_PREFIX, format_path_move(&proto_file, out_dir.join(format!("{}.rs", name))));
	tonic_build::configure()
		.build_server(false)
		.format(is_rustfmt_installed)
		.out_dir(&out_dir)
		.compile(&[&proto_file], &[&project_root()])
		.context("tonic build encountered an error")?;
	Ok(())
}

fn run_wasm_pack(release: bool, dir: impl AsRef<Path>) -> Result<()> {
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
	wasm_pack::command::run_wasm_pack(command).map_err(|e| anyhow!("{}", e)).context("failed to run wasm-pack")?;

	let from = dir.join("pkg");
	let to = project_root().join("static").join("wasm").join("tanks").join("pkg");
	run_rmdir(&to)?;
	run_copy_dir(&from, &to)?;
	Ok(())
}

fn run_cargo(subcommand: &str, release: bool, dir: impl AsRef<Path>) -> Result<()> {
	let dir = dir.as_ref();
	let mut args: Vec<&str> = Vec::new();
	args.push(subcommand);

	if release {
		args.push("--release");
	}
	println!("{}cargo {} ({})", XTASK_PREFIX, args.join(" "), dir.display());

	run_command(&cargo_exe(), &args, dir, None, false).map(|_| ())
}

fn run_cargo_watch(_release: bool, _dir: impl AsRef<Path>) -> Result<()> { todo!("impl cargo run, cargo run tanks") }

fn run_copy_exe(dir: impl AsRef<Path>) -> Result<()> {
	let dir = dir.as_ref();
	let exe_name = format!("trolleyman-org{}", std::env::consts::EXE_SUFFIX);
	run_copy_file(project_root().join("target").join("release").join(&exe_name), dir.join(&exe_name))
}

fn run_copy_file(from: impl AsRef<Path>, to: impl AsRef<Path>) -> Result<()> {
	let from = from.as_ref();
	let to = to.as_ref();
	println!("{}copy file {}", XTASK_PREFIX, format_path_move(from, to));

	fs_extra::file::copy(from, to, &fs_extra::file::CopyOptions {
		overwrite: true,
		..fs_extra::file::CopyOptions::new()
	})
	.context("failed to copy file")
	.map(|_| ())
}

fn run_copy_dir(from: impl AsRef<Path>, to: impl AsRef<Path>) -> Result<()> {
	let from = from.as_ref();
	let to = to.as_ref();
	println!("{}copy directory {}", XTASK_PREFIX, format_path_move(from, to));

	fs_extra::dir::copy(from, to, &fs_extra::dir::CopyOptions {
		overwrite: true,
		copy_inside: true,
		..fs_extra::dir::CopyOptions::new()
	})
	.context("failed to copy directory")
	.map(|_| ())
}

fn run_rmdir(dir: impl AsRef<Path>) -> Result<()> {
	let dir = dir.as_ref();
	println!("{}delete directory {}", XTASK_PREFIX, dir.display());
	fs_extra::dir::remove(dir).context("failed to delete directory")
}

fn format_path_move(from: impl AsRef<Path>, to: impl AsRef<Path>) -> String {
	let from = from.as_ref();
	let to = to.as_ref();
	if let Some(base) = common_path(from, to) {
		match (from.strip_prefix(&base), to.strip_prefix(&base)) {
			(Ok(from_strip), Ok(to_strip)) => format!(
				"{}{}{{{} -> {}}}",
				base.display(),
				std::path::MAIN_SEPARATOR,
				from_strip.display(),
				to_strip.display()
			),
			_ => format!("{} -> {}", from.display(), to.display()),
		}
	} else {
		format!("{} -> {}", from.display(), to.display())
	}
}

fn cargo_exe() -> String { std::env::var("CARGO").unwrap_or("cargo".into()) }

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
