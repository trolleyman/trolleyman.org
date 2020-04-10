use std::fs::OpenOptions;

use anyhow::Context;
use simplelog::{CombinedLogger, LevelFilter, SharedLogger, SimpleLogger, TermLogger, TerminalMode, WriteLogger};

use crate::{config::Config, error::Result};

pub fn setup(config: &Config, log_config: &simplelog::Config) -> Result<()> {
	let mut warn_msgs = vec![];
	let mut loggers: Vec<Box<dyn SharedLogger>> = vec![];

	// Terminal logger
	match TermLogger::new(LevelFilter::Info, log_config.clone(), TerminalMode::Mixed) {
		Some(l) => loggers.push(l),
		None => {
			loggers.push(SimpleLogger::new(LevelFilter::Info, log_config.clone()));
			warn_msgs.push("Terminal logger could not be initialized".to_string());
		}
	}

	// Log file
	if let Some(parent) = config.log_path.parent() {
		if let Err(e) = std::fs::create_dir_all(&parent) {
			warn_msgs.push(format!("Log file directory could not be created: {}: {}", parent.display(), e));
		}
	}
	match OpenOptions::new().create(true).append(true).open(&config.log_path) {
		Ok(file) => loggers.push(WriteLogger::new(LevelFilter::Debug, log_config.clone(), file)),
		Err(e) => warn_msgs.push(format!("Log file path could not be opened: {}: {}", &config.log_path.display(), e)),
	}

	// Combined final logger
	let ret = CombinedLogger::init(loggers).context("Failed to init combined logger").map_err(From::from);

	if ret.is_ok() {
		for warn_msg in warn_msgs.iter() {
			warn!("{}", warn_msg);
		}
	}
	ret
}
