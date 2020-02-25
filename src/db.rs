pub type DbError = diesel::result::Error;
pub type DbResult<T> = Result<T, DbError>;

#[database("db")]
pub struct DbConn(diesel::SqliteConnection);
