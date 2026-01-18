"""
Jobs.ge Parser - Batumi/Adjara Region
Bilingual job parser with SQLite storage for deduplication and analytics
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import sqlite3
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import argparse


class JobsDatabase:
    """SQLite database for job storage, deduplication, and analytics"""

    def __init__(self, db_path: str = "data/jobs.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Initialize database schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                -- Main jobs table
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    content_hash TEXT,
                    title_en TEXT,
                    title_ge TEXT,
                    company TEXT,
                    location TEXT,
                    published_en TEXT,
                    published_ge TEXT,
                    deadline_en TEXT,
                    deadline_ge TEXT,
                    body_en TEXT,
                    body_ge TEXT,
                    url_en TEXT,
                    url_ge TEXT,
                    has_salary BOOLEAN,
                    is_vip BOOLEAN DEFAULT 0,
                    region TEXT,
                    first_seen_at TEXT,
                    last_seen_at TEXT,
                    status TEXT DEFAULT 'active',
                    exported BOOLEAN DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );

                -- Job history for analytics (tracks changes over time)
                CREATE TABLE IF NOT EXISTS job_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT,
                    event_type TEXT,
                    event_data TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES jobs(id)
                );

                -- Scrape runs log
                CREATE TABLE IF NOT EXISTS scrape_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    started_at TEXT,
                    completed_at TEXT,
                    region TEXT,
                    total_found INTEGER,
                    new_jobs INTEGER,
                    updated_jobs INTEGER,
                    expired_jobs INTEGER,
                    status TEXT
                );

                -- Analytics snapshots (daily stats)
                CREATE TABLE IF NOT EXISTS daily_stats (
                    date TEXT PRIMARY KEY,
                    region TEXT,
                    total_active INTEGER,
                    new_today INTEGER,
                    expired_today INTEGER,
                    with_salary INTEGER,
                    vip_count INTEGER,
                    top_companies TEXT
                );

                -- Indexes for performance
                CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
                CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region);
                CREATE INDEX IF NOT EXISTS idx_jobs_exported ON jobs(exported);
                CREATE INDEX IF NOT EXISTS idx_jobs_last_seen ON jobs(last_seen_at);
                CREATE INDEX IF NOT EXISTS idx_history_job_id ON job_history(job_id);
            """)

    def _compute_hash(self, job: dict) -> str:
        """Compute content hash for change detection"""
        content = f"{job.get('title_en', '')}{job.get('title_ge', '')}{job.get('company', '')}{job.get('deadline_en', '')}"
        return hashlib.md5(content.encode()).hexdigest()

    def upsert_job(self, job: dict) -> tuple[str, bool, bool]:
        """
        Insert or update a job. Returns (job_id, is_new, is_updated)
        """
        job_id = job.get('id')
        if not job_id:
            return None, False, False

        content_hash = self._compute_hash(job)
        now = datetime.now().isoformat()

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Check if job exists
            cursor.execute("SELECT id, content_hash, status FROM jobs WHERE id = ?", (job_id,))
            existing = cursor.fetchone()

            if existing:
                old_hash, old_status = existing[1], existing[2]
                is_updated = old_hash != content_hash

                # Update existing job
                cursor.execute("""
                    UPDATE jobs SET
                        content_hash = ?,
                        title_en = ?,
                        title_ge = ?,
                        company = ?,
                        location = ?,
                        published_en = ?,
                        published_ge = ?,
                        deadline_en = ?,
                        deadline_ge = ?,
                        url_en = ?,
                        url_ge = ?,
                        has_salary = ?,
                        is_vip = ?,
                        region = ?,
                        last_seen_at = ?,
                        status = 'active'
                    WHERE id = ?
                """, (
                    content_hash,
                    job.get('title_en', ''),
                    job.get('title_ge', ''),
                    job.get('company', ''),
                    job.get('location', ''),
                    job.get('published_en', ''),
                    job.get('published_ge', ''),
                    job.get('deadline_en', ''),
                    job.get('deadline_ge', ''),
                    job.get('url_en', ''),
                    job.get('url_ge', ''),
                    job.get('has_salary', False),
                    job.get('is_vip', False),
                    job.get('region', ''),
                    now,
                    job_id
                ))

                # Log update event
                if is_updated:
                    cursor.execute(
                        "INSERT INTO job_history (job_id, event_type, event_data) VALUES (?, ?, ?)",
                        (job_id, 'updated', json.dumps({'old_hash': old_hash, 'new_hash': content_hash}))
                    )

                # If was expired, mark as reactivated
                if old_status == 'expired':
                    cursor.execute(
                        "INSERT INTO job_history (job_id, event_type, event_data) VALUES (?, ?, ?)",
                        (job_id, 'reactivated', '{}')
                    )

                return job_id, False, is_updated
            else:
                # Insert new job
                cursor.execute("""
                    INSERT INTO jobs (
                        id, content_hash, title_en, title_ge, company, location,
                        published_en, published_ge, deadline_en, deadline_ge,
                        url_en, url_ge, has_salary, is_vip, region,
                        first_seen_at, last_seen_at, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                """, (
                    job_id,
                    content_hash,
                    job.get('title_en', ''),
                    job.get('title_ge', ''),
                    job.get('company', ''),
                    job.get('location', ''),
                    job.get('published_en', ''),
                    job.get('published_ge', ''),
                    job.get('deadline_en', ''),
                    job.get('deadline_ge', ''),
                    job.get('url_en', ''),
                    job.get('url_ge', ''),
                    job.get('has_salary', False),
                    job.get('is_vip', False),
                    job.get('region', ''),
                    now,
                    now
                ))

                # Log new job event
                cursor.execute(
                    "INSERT INTO job_history (job_id, event_type, event_data) VALUES (?, ?, ?)",
                    (job_id, 'created', '{}')
                )

                return job_id, True, False

    def mark_expired(self, active_ids: set, region: str) -> int:
        """Mark jobs not in active_ids as expired. Returns count of expired jobs."""
        now = datetime.now().isoformat()
        expired_count = 0

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Get currently active jobs for this region
            cursor.execute(
                "SELECT id FROM jobs WHERE status = 'active' AND region = ?",
                (region,)
            )
            db_active_ids = {row[0] for row in cursor.fetchall()}

            # Find jobs that are no longer active
            expired_ids = db_active_ids - active_ids

            for job_id in expired_ids:
                cursor.execute(
                    "UPDATE jobs SET status = 'expired', last_seen_at = ? WHERE id = ?",
                    (now, job_id)
                )
                cursor.execute(
                    "INSERT INTO job_history (job_id, event_type, event_data) VALUES (?, ?, ?)",
                    (job_id, 'expired', '{}')
                )
                expired_count += 1

        return expired_count

    def log_scrape_run(self, region: str, total: int, new: int, updated: int, expired: int):
        """Log a scrape run"""
        now = datetime.now().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO scrape_runs (started_at, completed_at, region, total_found, new_jobs, updated_jobs, expired_jobs, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
            """, (now, now, region, total, new, updated, expired))

    def get_unexported_jobs(self, region: str = None) -> list[dict]:
        """Get jobs that haven't been exported yet (for website import)"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if region:
                cursor.execute("""
                    SELECT * FROM jobs
                    WHERE exported = 0 AND status = 'active' AND region = ?
                    ORDER BY first_seen_at DESC
                """, (region,))
            else:
                cursor.execute("""
                    SELECT * FROM jobs
                    WHERE exported = 0 AND status = 'active'
                    ORDER BY first_seen_at DESC
                """)

            return [dict(row) for row in cursor.fetchall()]

    def mark_exported(self, job_ids: list):
        """Mark jobs as exported"""
        with sqlite3.connect(self.db_path) as conn:
            conn.executemany(
                "UPDATE jobs SET exported = 1 WHERE id = ?",
                [(jid,) for jid in job_ids]
            )

    def update_job_body(self, job_id: str, bodies: dict):
        """Update job with body content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                UPDATE jobs SET
                    body_en = ?,
                    body_ge = ?
                WHERE id = ?
            """, (
                bodies.get('body_en', ''),
                bodies.get('body_ge', ''),
                job_id
            ))

    def get_active_jobs(self, region: str = None) -> list[dict]:
        """Get all active jobs"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if region:
                cursor.execute(
                    "SELECT * FROM jobs WHERE status = 'active' AND region = ? ORDER BY first_seen_at DESC",
                    (region,)
                )
            else:
                cursor.execute("SELECT * FROM jobs WHERE status = 'active' ORDER BY first_seen_at DESC")

            return [dict(row) for row in cursor.fetchall()]

    def get_jobs_missing_bodies(self, region: str = None) -> list[dict]:
        """Get jobs that are missing body content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            if region:
                cursor.execute("""
                    SELECT id, url_en, url_ge FROM jobs
                    WHERE status = 'active' AND region = ?
                    AND (body_en IS NULL OR body_en = '' OR body_ge IS NULL OR body_ge = '')
                    ORDER BY first_seen_at DESC
                """, (region,))
            else:
                cursor.execute("""
                    SELECT id, url_en, url_ge FROM jobs
                    WHERE status = 'active'
                    AND (body_en IS NULL OR body_en = '' OR body_ge IS NULL OR body_ge = '')
                    ORDER BY first_seen_at DESC
                """)

            return [dict(row) for row in cursor.fetchall()]

    def get_statistics(self, region: str = None) -> dict:
        """Get job market statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            region_filter = "AND region = ?" if region else ""
            params = (region,) if region else ()

            # Total active jobs
            cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE status = 'active' {region_filter}", params)
            total_active = cursor.fetchone()[0]

            # Jobs with salary
            cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE status = 'active' AND has_salary = 1 {region_filter}", params)
            with_salary = cursor.fetchone()[0]

            # VIP jobs
            cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE status = 'active' AND is_vip = 1 {region_filter}", params)
            vip_count = cursor.fetchone()[0]

            # New in last 24h
            yesterday = (datetime.now() - timedelta(days=1)).isoformat()
            cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE first_seen_at > ? {region_filter}", (yesterday,) + params)
            new_24h = cursor.fetchone()[0]

            # New in last 7 days
            week_ago = (datetime.now() - timedelta(days=7)).isoformat()
            cursor.execute(f"SELECT COUNT(*) FROM jobs WHERE first_seen_at > ? {region_filter}", (week_ago,) + params)
            new_7d = cursor.fetchone()[0]

            # Expired in last 24h
            cursor.execute(f"""
                SELECT COUNT(*) FROM job_history
                WHERE event_type = 'expired' AND created_at > ?
                {f"AND job_id IN (SELECT id FROM jobs WHERE region = ?)" if region else ""}
            """, (yesterday,) + params)
            expired_24h = cursor.fetchone()[0]

            # Top companies
            cursor.execute(f"""
                SELECT company, COUNT(*) as cnt
                FROM jobs
                WHERE status = 'active' AND company != '' {region_filter}
                GROUP BY company
                ORDER BY cnt DESC
                LIMIT 10
            """, params)
            top_companies = [{"company": row[0], "count": row[1]} for row in cursor.fetchall()]

            # Total historical jobs
            cursor.execute(f"SELECT COUNT(*) FROM jobs {f'WHERE region = ?' if region else ''}", params)
            total_historical = cursor.fetchone()[0]

            return {
                "total_active": total_active,
                "total_historical": total_historical,
                "with_salary": with_salary,
                "with_salary_pct": round(with_salary / total_active * 100, 1) if total_active > 0 else 0,
                "vip_count": vip_count,
                "new_last_24h": new_24h,
                "new_last_7d": new_7d,
                "expired_last_24h": expired_24h,
                "top_companies": top_companies,
                "generated_at": datetime.now().isoformat()
            }


class JobsGeParser:
    BASE_URL = "https://jobs.ge"

    REGIONS = {
        "adjara": 14,
        "tbilisi": 1,
        "imereti": 2,
        "kakheti": 3,
        "kvemo_kartli": 4,
        "shida_kartli": 5,
        "samtskhe": 6,
        "guria": 7,
        "samegrelo": 8,
        "racha": 9,
        "mtskheta": 10,
    }

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ka;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Cache-Control": "max-age=0",
    }

    def __init__(self, region: str = "adjara", db_path: str = "data/jobs.db"):
        self.region = region
        self.region_id = self.REGIONS.get(region, 14)
        self.db = JobsDatabase(db_path)
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)

    def _get_list_url(self, lang: str = "en") -> str:
        return f"{self.BASE_URL}/{lang}/?page=1&q=&cid=&lid={self.region_id}&jid="

    def _get_detail_url(self, job_id: str, lang: str = "en") -> str:
        return f"{self.BASE_URL}/{lang}/?view=jobs&id={job_id}"

    def fetch_page(self, url: str) -> Optional[str]:
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except requests.RequestException as e:
            print(f"[ERROR] Failed to fetch {url}: {e}")
            return None

    def parse_job_detail(self, html: str) -> str:
        """Extract the job description/body from a detail page"""
        soup = BeautifulSoup(html, 'html.parser')

        # Remove unwanted elements
        for elem in soup.find_all(['script', 'style', 'nav', 'header']):
            elem.decompose()

        # The job content is typically in table cells
        # Find the largest text block that contains job description
        best_content = ""

        for td in soup.find_all('td'):
            text = td.get_text(separator='\n', strip=True)
            # Look for substantial content (job descriptions are usually long)
            if len(text) > 200:
                # Skip if it's mostly navigation links
                links = td.find_all('a')
                if len(links) > 15:
                    continue
                # Check for job-related keywords (expanded list)
                keywords = [
                    'responsibilities', 'requirements', 'qualifications', 'skills', 'experience',
                    'duties', 'position', 'salary', 'benefits', 'apply', 'candidate', 'job',
                    'მოვალეობები', 'მოთხოვნები', 'კვალიფიკაცია', 'გამოცდილება', 'ანაზღაურება',
                    'პოზიცია', 'ვაკანსია', 'კანდიდატი', 'უნარები', 'cv', 'resume'
                ]
                if any(kw in text.lower() for kw in keywords):
                    if len(text) > len(best_content):
                        best_content = text

        # If still no content, try to get the largest text block
        if not best_content:
            for td in soup.find_all('td'):
                text = td.get_text(separator='\n', strip=True)
                if len(text) > 300 and len(text) > len(best_content):
                    links = td.find_all('a')
                    if len(links) < 20:
                        best_content = text

        # Clean up the content
        if best_content:
            # Remove duplicate whitespace and clean up
            lines = [line.strip() for line in best_content.split('\n') if line.strip()]
            # Remove navigation items at the start/end
            nav_items = ['all jobs', 'printer friendly', 'ყველა ვაკანსია', 'all ads', 'share on facebook',
                        'ამოსაბეჭდი', 'გააზიარე', 'facebook']
            while lines and any(nav in lines[0].lower() for nav in nav_items):
                lines.pop(0)
            while lines and any(nav in lines[-1].lower() for nav in nav_items):
                lines.pop()
            best_content = '\n'.join(lines)

        return best_content[:10000]  # Limit to 10k chars

    def fetch_job_body(self, job_id: str) -> dict:
        """Fetch job body/description in both languages"""
        bodies = {}

        for lang in ['en', 'ge']:
            url = self._get_detail_url(job_id, lang)
            html = self.fetch_page(url)
            if html:
                body = self.parse_job_detail(html)
                bodies[f'body_{lang}'] = body
            time.sleep(0.2)  # Be polite to server

        return bodies

    def parse_job_list(self, html: str, lang: str = "en") -> list[dict]:
        soup = BeautifulSoup(html, 'html.parser')
        jobs = []

        job_table = soup.find('table', id='job_list_table')
        if not job_table:
            return jobs

        for row in job_table.find_all('tr'):
            try:
                job = self._parse_row(row, lang)
                if job:
                    jobs.append(job)
            except:
                continue

        return jobs

    def _parse_row(self, row, lang: str) -> Optional[dict]:
        cells = row.find_all('td')
        if len(cells) < 3:
            return None

        job_link = row.find('a', href=lambda x: x and 'view=jobs&id=' in x)
        if not job_link:
            return None

        job_title = job_link.get_text(strip=True)
        job_href = job_link.get('href', '')

        job_id = None
        if 'id=' in job_href:
            try:
                job_id = job_href.split('id=')[1].split('&')[0]
            except:
                pass

        if not job_id:
            return None

        company_link = row.find('a', href=lambda x: x and 'view=client' in x)
        company = company_link.get_text(strip=True) if company_link else ""

        date_cells = [c.get_text(strip=True) for c in cells[-2:] if c.get_text(strip=True)]
        published = date_cells[0] if date_cells else ""
        deadline = date_cells[1] if len(date_cells) > 1 else ""

        imgs = row.find_all('img')
        has_salary = any('salary' in (img.get('src', '') or '').lower() for img in imgs)

        location = ""
        if " - " in job_title:
            parts = job_title.rsplit(" - ", 1)
            if len(parts) == 2:
                location = parts[1].strip()

        return {
            "id": job_id,
            f"title_{lang}": job_title,
            "company": company,
            "location": location,
            f"published_{lang}": published,
            f"deadline_{lang}": deadline,
            "has_salary": has_salary,
            "is_vip": False,
        }

    def parse_vip_jobs(self, html: str, lang: str = "en") -> list[dict]:
        soup = BeautifulSoup(html, 'html.parser')
        vip_jobs = []
        seen_ids = set()

        job_table = soup.find('table', id='job_list_table')
        all_links = soup.find_all('a', href=lambda x: x and 'view=jobs&id=' in x)

        for link in all_links:
            if job_table and link.find_parent('table', id='job_list_table'):
                continue

            job_href = link.get('href', '')
            job_id = None
            if 'id=' in job_href:
                try:
                    job_id = job_href.split('id=')[1].split('&')[0]
                except:
                    pass

            if job_id and job_id not in seen_ids:
                seen_ids.add(job_id)
                title = link.get_text(strip=True)

                parent = link.find_parent('tr') or link.find_parent('div')
                company = ""
                if parent:
                    company_link = parent.find('a', href=lambda x: x and 'view=client' in x)
                    if company_link:
                        company = company_link.get_text(strip=True)

                vip_jobs.append({
                    "id": job_id,
                    f"title_{lang}": title,
                    "company": company,
                    "is_vip": True,
                })

        return vip_jobs

    def merge_bilingual(self, en_jobs: list, ge_jobs: list) -> list[dict]:
        jobs_by_id = {}

        for job in en_jobs:
            job_id = job.get("id")
            if job_id:
                jobs_by_id[job_id] = job.copy()

        for job in ge_jobs:
            job_id = job.get("id")
            if job_id and job_id in jobs_by_id:
                for key, value in job.items():
                    if key.endswith("_ge") or key not in jobs_by_id[job_id]:
                        jobs_by_id[job_id][key] = value
            elif job_id:
                jobs_by_id[job_id] = job.copy()

        return list(jobs_by_id.values())

    def run(self, fetch_bodies: bool = True) -> dict:
        print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting parse...")
        print(f"[INFO] Region: {self.region} (lid={self.region_id})")

        # Fetch English
        print("[FETCH] English listings...")
        en_html = self.fetch_page(self._get_list_url("en"))
        en_jobs = self.parse_job_list(en_html, "en") if en_html else []
        en_vip = self.parse_vip_jobs(en_html, "en") if en_html else []

        # Fetch Georgian
        print("[FETCH] Georgian listings...")
        ge_html = self.fetch_page(self._get_list_url("ge"))
        ge_jobs = self.parse_job_list(ge_html, "ge") if ge_html else []
        ge_vip = self.parse_vip_jobs(ge_html, "ge") if ge_html else []

        # Merge bilingual
        jobs = self.merge_bilingual(en_jobs, ge_jobs)
        vip_jobs = self.merge_bilingual(en_vip, ge_vip)
        all_jobs = jobs + vip_jobs

        # Add metadata
        for job in all_jobs:
            job["region"] = self.region
            job["url_en"] = self._get_detail_url(job["id"], "en")
            job["url_ge"] = self._get_detail_url(job["id"], "ge")

        # Store in database with deduplication
        print("[DB] Storing jobs...")
        new_count = 0
        updated_count = 0
        active_ids = set()
        new_job_ids = []

        for job in all_jobs:
            job_id, is_new, is_updated = self.db.upsert_job(job)
            if job_id:
                active_ids.add(job_id)
                if is_new:
                    new_count += 1
                    new_job_ids.append(job_id)
                elif is_updated:
                    updated_count += 1

        # Mark expired jobs
        expired_count = self.db.mark_expired(active_ids, self.region)

        # Fetch bodies for NEW jobs only (to save time)
        if fetch_bodies and new_job_ids:
            print(f"[BODY] Fetching descriptions for {len(new_job_ids)} new jobs...")
            for i, job_id in enumerate(new_job_ids):
                bodies = self.fetch_job_body(job_id)
                if bodies:
                    self.db.update_job_body(job_id, bodies)
                if (i + 1) % 10 == 0:
                    print(f"[BODY] Progress: {i + 1}/{len(new_job_ids)}")
            print(f"[BODY] Completed fetching all descriptions")

        # Log scrape run
        self.db.log_scrape_run(self.region, len(all_jobs), new_count, updated_count, expired_count)

        print(f"[DONE] Total: {len(all_jobs)} | New: {new_count} | Updated: {updated_count} | Expired: {expired_count}")

        return {
            "total_found": len(all_jobs),
            "new_jobs": new_count,
            "updated_jobs": updated_count,
            "expired_jobs": expired_count,
            "region": self.region
        }

    def export_for_website(self, output_path: str = None) -> str:
        """Export new/unexported jobs for website import"""
        jobs = self.db.get_unexported_jobs(self.region)

        if not jobs:
            print("[EXPORT] No new jobs to export")
            return None

        output_path = output_path or f"data/export_{self.region}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        # Convert for export
        export_data = {
            "exported_at": datetime.now().isoformat(),
            "region": self.region,
            "count": len(jobs),
            "jobs": jobs
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)

        # Mark as exported
        self.db.mark_exported([j['id'] for j in jobs])

        print(f"[EXPORT] Exported {len(jobs)} jobs to {output_path}")
        return output_path

    def export_all_active(self, output_path: str = None) -> str:
        """Export all active jobs (for full sync)"""
        jobs = self.db.get_active_jobs(self.region)

        output_path = output_path or f"data/all_active_{self.region}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        export_data = {
            "exported_at": datetime.now().isoformat(),
            "region": self.region,
            "count": len(jobs),
            "jobs": jobs
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2)

        print(f"[EXPORT] Exported {len(jobs)} active jobs to {output_path}")
        return output_path

    def get_analytics(self) -> dict:
        """Get job market analytics"""
        return self.db.get_statistics(self.region)

    def backfill_bodies(self) -> int:
        """Fetch bodies for all jobs that are missing them"""
        jobs = self.db.get_jobs_missing_bodies(self.region)

        if not jobs:
            print("[BACKFILL] All jobs already have body content")
            return 0

        print(f"[BACKFILL] Found {len(jobs)} jobs missing body content")

        filled = 0
        for i, job in enumerate(jobs):
            job_id = job['id']
            bodies = self.fetch_job_body(job_id)
            if bodies and (bodies.get('body_en') or bodies.get('body_ge')):
                self.db.update_job_body(job_id, bodies)
                filled += 1

            if (i + 1) % 20 == 0:
                print(f"[BACKFILL] Progress: {i + 1}/{len(jobs)} ({filled} filled)")

        print(f"[BACKFILL] Completed: {filled}/{len(jobs)} jobs updated with body content")
        return filled


def main():
    parser = argparse.ArgumentParser(description='Jobs.ge Parser with Deduplication')
    parser.add_argument('--region', default='adjara', choices=list(JobsGeParser.REGIONS.keys()))
    parser.add_argument('--export', action='store_true', help='Export new jobs for website')
    parser.add_argument('--export-all', action='store_true', help='Export all active jobs')
    parser.add_argument('--stats', action='store_true', help='Show statistics')
    parser.add_argument('--no-bodies', action='store_true', help='Skip fetching job descriptions (faster)')
    parser.add_argument('--backfill-bodies', action='store_true', help='Fetch bodies for jobs missing them')
    parser.add_argument('--schedule', type=int, metavar='MINUTES', help='Run on schedule (interval in minutes)')

    args = parser.parse_args()

    job_parser = JobsGeParser(region=args.region)
    fetch_bodies = not args.no_bodies

    if args.stats:
        stats = job_parser.get_analytics()
        print("\n" + "=" * 50)
        print(f"JOB MARKET STATISTICS - {args.region.upper()}")
        print("=" * 50)
        print(f"Active jobs:        {stats['total_active']}")
        print(f"Historical total:   {stats['total_historical']}")
        print(f"With salary:        {stats['with_salary']} ({stats['with_salary_pct']}%)")
        print(f"VIP listings:       {stats['vip_count']}")
        print(f"New (24h):          {stats['new_last_24h']}")
        print(f"New (7 days):       {stats['new_last_7d']}")
        print(f"Expired (24h):      {stats['expired_last_24h']}")
        print("\nTop Companies:")
        for c in stats['top_companies'][:5]:
            print(f"  - {c['company']}: {c['count']} jobs")
        print("=" * 50)
        return

    if args.backfill_bodies:
        job_parser.backfill_bodies()
        return

    if args.schedule:
        import schedule as sched
        print(f"[SCHEDULER] Running every {args.schedule} minutes. Press Ctrl+C to stop.")
        job_parser.run(fetch_bodies=fetch_bodies)
        sched.every(args.schedule).minutes.do(lambda: job_parser.run(fetch_bodies=fetch_bodies))
        while True:
            sched.run_pending()
            time.sleep(30)
    else:
        result = job_parser.run(fetch_bodies=fetch_bodies)

        if args.export:
            job_parser.export_for_website()

        if args.export_all:
            job_parser.export_all_active()

        # Show quick stats
        stats = job_parser.get_analytics()
        print(f"\n[STATS] Active: {stats['total_active']} | New 24h: {stats['new_last_24h']} | With salary: {stats['with_salary_pct']}%")


if __name__ == "__main__":
    main()
