import sqlite3
import sys

DB_FILE = 'backend/database/database.sqlite'
OUTPUT_FILE = 'local_data_dump.sql'

TABLES = [
    'users',
    'courses',
    'payments',
    'student_registrations',
    'tutor_payments',
    'enrollments',
    'messages',
    'course_options',
    'registration_form_options',
    'registration_form_settings',
    'settings',
    'chapters',
    'lessons',
    'live_classes'
]

def get_create_start(table):
    return "" 
    # We assume schema exists on remote, so no CREATE TABLE

def escape_string(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    # Replace single quotes with escaped single quotes for SQL
    # standard SQL escape is '' but MySQL accepts \' too. Let's use \' for safety if NO_BACKSLASH_ESCAPES is not set.
    # Actually, standard SQL is ''.
    return "'" + str(val).replace("'", "''").replace("\\", "\\\\") + "'"

def dump_table(cursor, table_name, f):
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
    except sqlite3.OperationalError:
        print(f"Skipping {table_name} (not found)")
        return

    rows = cursor.fetchall()
    if not rows:
        return

    # Get column names
    columns = [description[0] for description in cursor.description]
    col_str = ", ".join([f"`{c}`" for c in columns])

    f.write(f"-- Dumping data for table {table_name}\n")
    
    for row in rows:
        vals = []
        for val in row:
            vals.append(escape_string(val))
        val_str = ", ".join(vals)
        # Use INSERT IGNORE to skip duplicates
        f.write(f"INSERT IGNORE INTO `{table_name}` ({col_str}) VALUES ({val_str});\n")
    f.write("\n")

def main():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("SET FOREIGN_KEY_CHECKS=0;\n")
        for table in TABLES:
            dump_table(cursor, table, f)
        f.write("SET FOREIGN_KEY_CHECKS=1;\n")
    
    conn.close()
    print(f"Dumped to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
