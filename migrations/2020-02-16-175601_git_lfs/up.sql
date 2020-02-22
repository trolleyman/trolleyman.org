
CREATE TABLE git_lfs_repository (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	UNIQUE("owner", "name")
);

CREATE TABLE git_lfs_object (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"oid" TEXT NOT NULL,
	"size" UNSIGNED BIG INT NOT NULL,
	"valid" BOOLEAN NOT NULL CHECK ("valid" IN (0,1)),
	"repository" INTEGER NOT NULL REFERENCES git_lfs_repository(id),
	UNIQUE("oid", "repository")
);
