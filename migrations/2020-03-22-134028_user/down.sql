
CREATE TABLE git_lfs_repository_new (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	UNIQUE("owner", "name")
);

INSERT INTO git_lfs_repository_new SELECT * FROM git_lfs_repository;
DROP TABLE git_lfs_repository;
ALTER TABLE git_lfs_repository_new RENAME TO git_lfs_repository;

DROP TABLE user;
