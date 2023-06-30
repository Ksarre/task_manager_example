
CREATE EXTENSION citext;

CREATE TABLE IF NOT EXISTS service_user(
    registered_on TIME with time zone DEFAULT Now(),
    username VARCHAR(255) PRIMARY KEY,
    user_hash VARCHAR(255) NOT NULL,
    email citext NOT NULL,
    UNIQUE(username),
    UNIQUE(email)
);
CREATE TABLE IF NOT EXISTS organization(
    org_name VARCHAR(255) NOT NULL PRIMARY KEY
);

-- cascade delete on organization removal --
CREATE TABLE IF NOT EXISTS task(
    task_id serial PRIMARY KEY,
    author VARCHAR(255) NOT NULL REFERENCES service_user(username),
    assignee VARCHAR(255) REFERENCES service_user(username),
    organization VARCHAR(255) NOT NULL REFERENCES organization(org_name),
    task_title VARCHAR NOT NULL,
    task_descr VARCHAR,
    severity VARCHAR,
    created_at TIME with time zone DEFAULT Now()
);
-- cascade delete on organization removal --
CREATE TABLE IF NOT EXISTS service_user_to_organization(
    map_id serial PRIMARY KEY,
    organization VARCHAR(255) NOT NULL REFERENCES organization(org_name),
    username VARCHAR(255) NOT NULL REFERENCES service_user(username),
    admin_perm BOOLEAN NOT NULL DEFAULT 'f',
    read_perm BOOLEAN NOT NULL DEFAULT 'f',
    write_perm BOOLEAN NOT NULL DEFAULT 'f',
    del_perm BOOLEAN NOT NULL DEFAULT 'f',
    created_at TIME with time zone DEFAULT NOW(),
    UNIQUE(organization, username)
);
-- cascade delete on task removal --
CREATE TABLE IF NOT EXISTS service_user_to_task(
    map_id serial PRIMARY KEY,
    username VARCHAR(255) REFERENCES service_user(username),
    task_id serial REFERENCES task(task_id),
    UNIQUE(task_id, username)
);
-- cascade delete on task removal --
CREATE TABLE IF NOT EXISTS comment(
    comment_id serial PRIMARY KEY,
    author VARCHAR(255) NOT NULL REFERENCES service_user(username),
    task_id serial NOT NULL REFERENCES task(task_id),
    organization VARCHAR(255) NOT NULL REFERENCES organization(org_name),
    comment_msg VARCHAR NOT NULL,
    created_at TIME with time zone DEFAULT Now(),
    replied_to INTEGER REFERENCES comment,
    deleted BOOLEAN NOT NULL DEFAULT 'f'
);