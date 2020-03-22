
CREATE TABLE user (
	"name" VARCHAR(64) PRIMARY KEY NOT NULL,
	"email" VARCHAR(127) NOT NULL,
	-- Stored in the format "<hash-algorithm>:<salt>:<hashed-password>"
	-- Currently the only supported hash-algorithm is "sha3_512"
	"password" TEXT NOT NULL,
	"created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"admin" BOOLEAN NOT NULL DEFAULT 0 CHECK ("admin" IN (0,1)),
	UNIQUE("email")
);

CREATE TABLE git_lfs_repository_new (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"owner" TEXT NOT NULL REFERENCES user("name"),
	"name" TEXT NOT NULL,
	UNIQUE("owner", "name")
);

INSERT INTO user (name, email, password) SELECT DISTINCT owner, (owner || "-invalid-email@"), "sha3_512:EomFe4Y5H2a8dnqasQC5Brze8bmg56mY:27ad033216f233abcdf26d796cbb0f76eacc5ef6c48b6769c8eae8026eff587593bea78d248a2e05eaee67bd7d8b3b93c86fd079bb8ea5fe8f1edb0570a11c19" FROM git_lfs_repository;
INSERT INTO git_lfs_repository_new SELECT * FROM git_lfs_repository;
DROP TABLE git_lfs_repository;
ALTER TABLE git_lfs_repository_new RENAME TO git_lfs_repository;
