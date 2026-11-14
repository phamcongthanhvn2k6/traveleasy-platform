import os
import pg8000.native
import ssl
import sys
import datetime
import decimal
import json

def sql_quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float, decimal.Decimal)):
        return str(val)
    if isinstance(val, (datetime.datetime, datetime.date, datetime.time)):
        return "'" + str(val) + "'"
    if isinstance(val, (dict, list)):
        s = json.dumps(val, ensure_ascii=False)
        return "'" + s.replace("'", "''") + "'::jsonb"
    s = str(val)
    return "'" + s.replace("'", "''") + "'"

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    db_host = os.environ.get('SUPABASE_DB_HOST', 'aws-0-ap-southeast-2.pooler.supabase.com')
    db_port = int(os.environ.get('SUPABASE_DB_PORT', '6543'))
    db_name = os.environ.get('SUPABASE_DB_NAME', 'postgres')
    db_user = os.environ.get('SUPABASE_DB_USER', 'postgres.ctvcwhdepzyvqsncbslf')
    db_password = os.environ.get('SUPABASE_DB_PASSWORD')

    if not db_password:
        print("ERROR: SUPABASE_DB_PASSWORD environment variable is not set. Please set it before running this script.")
        sys.exit(1)

    con = pg8000.native.Connection(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password,
        ssl_context=ctx
    )

    print("Connected to Supabase PostgreSQL.")
    
    # Get all tables in public schema
    tables_res = con.run("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
    """)
    tables = [r[0] for r in tables_res]
    print(f"Found {len(tables)} tables: {tables}")

    out_file = "init.sql"
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("-- =====================================================================\n")
        f.write("-- TRAVELEASY PLATFORM — SUPABASE POSTGRESQL FULL DATABASE BACKUP\n")
        f.write(f"-- Generated At: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
        f.write("-- Environment: Production Supabase PostgreSQL (Project: ctvcwhdepzyvqsncbslf)\n")
        f.write("-- Includes DDL schema, sequences, constraints, and full live dataset.\n")
        f.write("-- =====================================================================\n\n")
        f.write("SET statement_timeout = 0;\n")
        f.write("SET lock_timeout = 0;\n")
        f.write("SET idle_in_transaction_session_timeout = 0;\n")
        f.write("SET client_encoding = 'UTF8';\n")
        f.write("SET standard_conforming_strings = on;\n")
        f.write("SET check_function_bodies = false;\n")
        f.write("SET xmloption = content;\n")
        f.write("SET client_min_messages = warning;\n")
        f.write("SET row_security = off;\n")
        f.write("SET session_replication_role = 'replica';\n\n")

        # 1. DDL for each table
        for table in tables:
            f.write(f"-- -----------------------------------------------------\n")
            f.write(f"-- Table: {table}\n")
            f.write(f"-- -----------------------------------------------------\n")
            f.write(f"CREATE TABLE IF NOT EXISTS public.{table} (\n")

            cols_res = con.run(f"""
                SELECT 
                    column_name, 
                    data_type, 
                    character_maximum_length,
                    is_nullable, 
                    column_default,
                    is_identity,
                    identity_generation,
                    udt_name
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '{table}'
                ORDER BY ordinal_position;
            """)

            col_defs = []
            for col in cols_res:
                c_name, c_type, c_max_len, c_null, c_def, c_is_id, c_id_gen, c_udt = col
                type_str = c_type.upper()
                if c_max_len and 'CHAR' in type_str:
                    type_str = f"VARCHAR({c_max_len})"
                elif type_str == 'USER-DEFINED':
                    type_str = c_udt
                
                parts = [f"    {c_name} {type_str}"]
                if c_is_id == 'YES':
                    parts.append(f"GENERATED {c_id_gen} AS IDENTITY")
                elif c_def is not None:
                    parts.append(f"DEFAULT {c_def}")
                
                if c_null == 'NO':
                    parts.append("NOT NULL")
                
                col_defs.append(" ".join(parts))

            # Primary Key
            pk_res = con.run(f"""
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = 'public'
                  AND tc.table_name = '{table}'
                  AND tc.constraint_type = 'PRIMARY KEY'
                ORDER BY kcu.ordinal_position;
            """)
            if pk_res:
                pk_cols = ", ".join([r[0] for r in pk_res])
                col_defs.append(f"    CONSTRAINT pk_{table} PRIMARY KEY ({pk_cols})")

            f.write(",\n".join(col_defs))
            f.write("\n);\n\n")

        # 2. DML (Insert data)
        for table in tables:
            cnt_res = con.run(f"SELECT COUNT(*) FROM public.{table};")
            row_cnt = cnt_res[0][0]
            if row_cnt == 0:
                continue

            f.write(f"-- -----------------------------------------------------\n")
            f.write(f"-- Data for table: {table} ({row_cnt} rows)\n")
            f.write(f"-- -----------------------------------------------------\n")

            # Get column names
            cols_res = con.run(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = '{table}'
                ORDER BY ordinal_position;
            """)
            col_names = [c[0] for c in cols_res]
            col_list_str = ", ".join(col_names)

            # Fetch rows in batches of 500
            batch_size = 500
            offset = 0
            while offset < row_cnt:
                rows_res = con.run(f"""
                    SELECT {col_list_str} 
                    FROM public.{table} 
                    ORDER BY 1 
                    LIMIT {batch_size} OFFSET {offset};
                """)
                if not rows_res:
                    break

                val_rows = []
                for row in rows_res:
                    vals = [sql_quote(v) for v in row]
                    val_rows.append(f"({', '.join(vals)})")

                f.write(f"INSERT INTO public.{table} ({col_list_str}) VALUES\n")
                f.write(",\n".join(val_rows))
                f.write(";\n\n")

                offset += batch_size

        # 3. Synchronize sequences
        f.write("-- -----------------------------------------------------\n")
        f.write("-- Reset Sequences\n")
        f.write("-- -----------------------------------------------------\n")
        f.write("DO $$\nBEGIN\n")
        for table in tables:
            f.write(f"    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '{table}' AND column_name = 'id') THEN\n")
            f.write(f"        BEGIN\n")
            f.write(f"            PERFORM setval(pg_get_serial_sequence('public.{table}', 'id'), COALESCE((SELECT MAX(id) FROM public.{table}), 1));\n")
            f.write(f"        EXCEPTION WHEN OTHERS THEN NULL;\n")
            f.write(f"        END;\n")
            f.write(f"    END IF;\n")
        f.write("END $$;\n\n")

        f.write("SET session_replication_role = 'origin';\n")
        f.write("-- =====================================================================\n")
        f.write("-- BACKUP COMPLETE\n")
        f.write("-- =====================================================================\n")

    con.close()
    print("Database dump generated successfully into init.sql!")

if __name__ == "__main__":
    main()
