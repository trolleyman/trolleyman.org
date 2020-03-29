
CREATE TABLE session_token (
	"token" TEXT PRIMARY KEY NOT NULL,
	"user" INTEGER NOT NULL REFERENCES user("id"),
	"expires" TIMESTAMP NOT NULL
);
