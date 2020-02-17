
CREATE TABLE git_lfs_repository (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" TEXT NOT NULL,
	"name" TEXT NOT NULL
);

CREATE TABLE git_lfs_object (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"size" INTEGER NOT NULL,
	"repository" INTEGER NOT NULL REFERENCES git_lfs_repository(id)
);
