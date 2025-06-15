-- Custom SQL migration file, put your code below! --
CREATE INDEX IF NOT EXISTS vector_index ON documents_chunk(libsql_vector_idx(vector));