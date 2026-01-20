"""Database router - database browser."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.database import get_db

router = APIRouter()


class QueryRequest(BaseModel):
    """Query request model."""
    sql: str
    limit: Optional[int] = 100


@router.get("/tables")
async def list_tables(db: AsyncSession = Depends(get_db)):
    """List all database tables."""
    result = await db.execute(text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """))

    tables = []
    for row in result.fetchall():
        table_name = row[0]
        # Get row count
        count_result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        count = count_result.scalar()
        tables.append({"name": table_name, "row_count": count})

    return {"tables": tables}


@router.get("/tables/{table_name}")
async def get_table_info(table_name: str, db: AsyncSession = Depends(get_db)):
    """Get table structure and sample data."""
    # Validate table name (prevent SQL injection)
    result = await db.execute(text("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = :name
    """), {"name": table_name})

    if not result.fetchone():
        raise HTTPException(status_code=404, detail="Table not found")

    # Get columns
    result = await db.execute(text("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = :name
        ORDER BY ordinal_position
    """), {"name": table_name})

    columns = [
        {
            "name": row[0],
            "type": row[1],
            "nullable": row[2] == "YES",
            "default": row[3],
        }
        for row in result.fetchall()
    ]

    # Get row count
    result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
    row_count = result.scalar()

    # Get sample rows
    result = await db.execute(text(f"SELECT * FROM {table_name} LIMIT 10"))
    sample_rows = []
    col_names = list(result.keys())
    for row in result.fetchall():
        row_dict = {}
        for i, val in enumerate(row):
            # Convert to string for JSON serialization
            if val is None:
                row_dict[col_names[i]] = None
            elif hasattr(val, "isoformat"):
                row_dict[col_names[i]] = val.isoformat()
            else:
                row_dict[col_names[i]] = str(val)
        sample_rows.append(row_dict)

    return {
        "name": table_name,
        "columns": columns,
        "row_count": row_count,
        "sample_rows": sample_rows,
    }


@router.post("/query")
async def run_query(request: QueryRequest, db: AsyncSession = Depends(get_db)):
    """Run a read-only SQL query."""
    sql = request.sql.strip()

    # Only allow SELECT queries
    if not sql.upper().startswith("SELECT"):
        raise HTTPException(
            status_code=400,
            detail="Only SELECT queries are allowed"
        )

    # Block dangerous keywords
    dangerous = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE"]
    sql_upper = sql.upper()
    for keyword in dangerous:
        if keyword in sql_upper:
            raise HTTPException(
                status_code=400,
                detail=f"Query contains forbidden keyword: {keyword}"
            )

    try:
        # Add LIMIT if not present
        if "LIMIT" not in sql_upper:
            sql = f"{sql} LIMIT {request.limit}"

        result = await db.execute(text(sql))
        columns = list(result.keys())
        rows = []

        for row in result.fetchall():
            row_dict = {}
            for i, val in enumerate(row):
                if val is None:
                    row_dict[columns[i]] = None
                elif hasattr(val, "isoformat"):
                    row_dict[columns[i]] = val.isoformat()
                else:
                    row_dict[columns[i]] = str(val)
            rows.append(row_dict)

        return {
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
