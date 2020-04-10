use std::io::{self, Read};

#[derive(thiserror::Error, Debug)]
pub enum ReadLimitedError {
	#[error(transparent)]
	IoError(#[from] io::Error),
	#[error("read more bytes than expected (read {}, expected {})", .buffer.len(), .limit)]
	LimitedRead { limit: usize, buffer: Vec<u8> },
}

pub fn read_limited<R>(reader: &mut R, limit: usize) -> Result<Vec<u8>, ReadLimitedError>
where
	R: Read,
{
	let mut buffer = vec![0u8; 1024];

	let mut offset = 0usize;
	loop {
		if buffer.len() - offset < 1024 {
			buffer.resize(buffer.len() * 2, 0);
		}
		let end_idx = buffer.len().min(limit + 1);
		let read = reader.read(&mut buffer[offset..end_idx])?;
		offset += read;
		if offset > limit {
			buffer.resize(offset, 0);
			return Err(ReadLimitedError::LimitedRead { limit, buffer });
		}
		if read == 0 {
			break;
		}
	}

	buffer.resize(offset, 0);
	Ok(buffer)
}

pub fn read_limited_string<R>(reader: &mut R, limit: usize) -> Result<String, ReadLimitedError>
where
	R: Read,
{
	let buffer = read_limited(reader, limit)?;
	String::from_utf8(buffer).map_err(|_| io::Error::from(io::ErrorKind::InvalidData).into())
}

#[cfg(test)]
mod test {
	#[test]
	fn test_read_limited() {
		fn read_bytes(bytes: &[u8], limit: usize) -> Result<Vec<u8>, super::ReadLimitedError> {
			let mut cursor = Cursor::new(bytes);
			super::read_limited(&mut cursor, limit)
		}
		use std::io::Cursor;

		let bytes = (0u8..255).cycle().take(1100).collect::<Vec<_>>();
		assert!(read_bytes(&bytes, 0).is_err());
		assert!(read_bytes(&bytes, 16).is_err());
		assert!(read_bytes(&bytes, 1099).is_err());
		assert_eq!(&bytes, &read_bytes(&bytes, 1100).unwrap());
		assert_eq!(&bytes, &read_bytes(&bytes, 1101).unwrap());
	}
}
