
CREATE TABLE git_lfs_upload_token (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"token" TEXT NOT NULL,
	"repository" INTEGER NOT NULL REFERENCES git_lfs_repository(id),
	"object" INTEGER NOT NULL REFERENCES git_lfs_object(id),
	"expires" TIMESTAMP NOT NULL
);
