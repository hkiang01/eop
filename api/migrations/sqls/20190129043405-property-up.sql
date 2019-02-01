CREATE TABLE property (
    id  UUID DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    entity_id UUID REFERENCES entity(id),
    sample_value TEXT,
    PRIMARY KEY (id)
);