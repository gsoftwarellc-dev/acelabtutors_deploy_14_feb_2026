#!/bin/bash
sqlite3 backend/database/database.sqlite ".tables"
echo "--- Users ---"
sqlite3 backend/database/database.sqlite "SELECT count(*) FROM users;"
