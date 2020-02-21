
CREATE TABLE git_lfs_upload_token (
	"token" TEXT PRIMARY KEY NOT NULL,
	"object" INTEGER NOT NULL REFERENCES git_lfs_object(id),
	"expires" TIMESTAMP NOT NULL
);
