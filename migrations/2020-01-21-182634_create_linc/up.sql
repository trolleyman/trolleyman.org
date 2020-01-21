
CREATE TABLE linc_interest (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"desc" VARCHAR(150) NOT NULL
);

CREATE TABLE linc_person (
	"id" INTEGER PRIMARY KEY NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"interest1_id" INTEGER NOT NULL REFERENCES linc_interest ("id"),
	"interest2_id" INTEGER NOT NULL REFERENCES linc_interest ("id"),
	"interest3_id" INTEGER NOT NULL REFERENCES linc_interest ("id"),
	"twitter_pic_url" VARCHAR(512) NULL,
	"twitter" VARCHAR(15) NULL
);
