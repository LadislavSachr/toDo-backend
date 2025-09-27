CREATE TABLE users(
	id varchar(36) PRIMARY KEY,
	first_name varchar(20),
	last_name varchar(20),
	email varchar(30),
  facebook_id varchar(36),
  google_id varchar(36),
  provider varchar(20),
	password varchar(72)
);

CREATE TABLE tasks(
    user_id varchar(36) REFERENCES users(id),
  	task_id integer NOT NULL DEFAULT 1,
    task varchar(150) NOT NULL,
    category varchar(10) NOT NULL,
    PRIMARY KEY(user_id,task_id)
);