
CREATE TABLE user (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"name" VARCHAR(64) NOT NULL,
	"email" VARCHAR(127) NOT NULL,
	-- Stored in the format "<hash-algorithm>:<salt>:<hashed-password>"
	-- Currently the only supported hash-algorithm is "sha3_512"
	"password" TEXT NOT NULL,
	"created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"admin" BOOLEAN NOT NULL DEFAULT 0 CHECK ("admin" IN (0,1)),
	UNIQUE("name"), UNIQUE("email")
);

CREATE TABLE git_lfs_repository_new (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" INTEGER NOT NULL REFERENCES user("id"),
	"name" TEXT NOT NULL,
	UNIQUE("owner", "name")
);

INSERT INTO user (name, email, password) SELECT DISTINCT owner, (owner || "-invalid-email@"), "sha3_512:EomFe4Y5H2a8dnqasQC5Brze8bmg56mY:J60DMhbyM6vN8m15bLsPdurMXvbEi2dpyOroAm7/WHWTvqeNJIouBeruZ719izuTyG/QebuOpf6PHtsFcKEcGQ==" FROM git_lfs_repository;
INSERT INTO git_lfs_repository_new(id, owner, name) SELECT git_lfs_repository.id, user.id, git_lfs_repository.name FROM git_lfs_repository LEFT JOIN user ON user.name == git_lfs_repository.owner;

PRAGMA defer_foreign_keys=on;
PRAGMA foreign_keys=off;
DROP TABLE git_lfs_repository;
ALTER TABLE git_lfs_repository_new RENAME TO git_lfs_repository;
PRAGMA foreign_keys=on;
PRAGMA defer_foreign_keys=off;
