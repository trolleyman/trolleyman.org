
CREATE TABLE git_lfs_repository (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	UNIQUE("owner", "name")
);

CREATE TABLE git_lfs_object (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"oid" TEXT NOT NULL,
	"size" INTEGER NOT NULL,
	"repository" INTEGER NOT NULL REFERENCES git_lfs_repository(id),
	UNIQUE("oid", "repository")
);
