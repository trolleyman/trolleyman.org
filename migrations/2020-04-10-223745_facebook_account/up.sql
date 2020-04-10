
CREATE TABLE facebook_account (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"user_id" INTEGER NOT NULL REFERENCES user("id"),
	"email" TEXT NOT NULL,
	"password" TEXT NOT NULL,
	UNIQUE ("user_id")
);
