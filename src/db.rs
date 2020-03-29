pub type DbError = diesel::result::Error;
pub type DbResult<T> = Result<T, DbError>;

pub type DbConn = diesel::SqliteConnection;

#[database("db")]
pub struct DbConnGuard(DbConn);
