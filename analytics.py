"""
Jobs.ge Analytics Module
Provides category classification, time series metrics, and Prometheus-style data export
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from collections import defaultdict
import re


# Job categories with keywords for classification
CATEGORIES = {
    "Administration/Management": {
        "id": 1,
        "keywords_en": ["manager", "director", "administrator", "supervisor", "coordinator", "executive", "head of", "chief", "ceo", "coo", "cfo", "lead", "team lead"],
        "keywords_ge": ["მენეჯერი", "დირექტორი", "ადმინისტრატორი", "ხელმძღვანელი", "კოორდინატორი"],
        "color": "#FF6B6B"
    },
    "Sales/Procurement": {
        "id": 2,
        "keywords_en": ["sales", "seller", "procurement", "buyer", "purchasing", "business development", "account manager", "retail", "cashier", "consultant", "preseller"],
        "keywords_ge": ["გაყიდვები", "მყიდველი", "შესყიდვები", "კონსულტანტი", "მოლარე"],
        "color": "#4ECDC4"
    },
    "Finance/Statistics": {
        "id": 3,
        "keywords_en": ["finance", "accountant", "accounting", "auditor", "financial", "banker", "bank", "credit", "loan", "economist", "statistics", "analyst"],
        "keywords_ge": ["ფინანსები", "ბუღალტერი", "აუდიტორი", "ბანკი", "ეკონომისტი"],
        "color": "#45B7D1"
    },
    "PR/Marketing": {
        "id": 4,
        "keywords_en": ["marketing", "pr", "public relations", "brand", "advertising", "seo", "smm", "content", "copywriter", "social media", "digital marketing"],
        "keywords_ge": ["მარკეტინგი", "რეკლამა", "კონტენტი", "ბრენდი"],
        "color": "#96CEB4"
    },
    "IT/Programming": {
        "id": 6,
        "keywords_en": ["developer", "programmer", "software", "engineer", "devops", "frontend", "backend", "fullstack", "web", "mobile", "data scientist", "qa", "tester", "it ", "tech", "system admin", "database", "python", "java", "javascript", "react", "node"],
        "keywords_ge": ["პროგრამისტი", "დეველოპერი", "ინჟინერი"],
        "color": "#9B59B6"
    },
    "Logistics/Transport": {
        "id": 5,
        "keywords_en": ["logistics", "driver", "delivery", "transport", "warehouse", "shipping", "courier", "dispatcher", "fleet", "supply chain", "forklift"],
        "keywords_ge": ["ლოჯისტიკა", "მძღოლი", "კურიერი", "საწყობი", "ტრანსპორტი"],
        "color": "#F39C12"
    },
    "Construction/Repair": {
        "id": 11,
        "keywords_en": ["construction", "builder", "architect", "engineer", "repair", "electrician", "plumber", "carpenter", "welder", "hvac", "mason"],
        "keywords_ge": ["მშენებლობა", "არქიტექტორი", "ელექტრიკოსი", "შემკეთებელი"],
        "color": "#E67E22"
    },
    "Education": {
        "id": 12,
        "keywords_en": ["teacher", "instructor", "tutor", "professor", "trainer", "education", "lecturer", "school", "university", "academy", "coach"],
        "keywords_ge": ["მასწავლებელი", "ტრენერი", "ლექტორი", "პროფესორი"],
        "color": "#1ABC9C"
    },
    "Medicine/Pharmacy": {
        "id": 8,
        "keywords_en": ["doctor", "nurse", "medical", "pharmacy", "pharmacist", "healthcare", "clinic", "hospital", "dentist", "therapist", "surgeon"],
        "keywords_ge": ["ექიმი", "მედია", "ფარმაცევტი", "კლინიკა"],
        "color": "#E74C3C"
    },
    "Food/Hospitality": {
        "id": 10,
        "keywords_en": ["cook", "chef", "waiter", "waitress", "bartender", "restaurant", "kitchen", "hotel", "hospitality", "barista", "food", "cafe", "catering"],
        "keywords_ge": ["მზარეული", "მიმტანი", "ბარმენი", "რესტორანი", "სასტუმრო"],
        "color": "#D35400"
    },
    "Security/Safety": {
        "id": 17,
        "keywords_en": ["security", "guard", "safety", "officer", "protection", "surveillance"],
        "keywords_ge": ["დაცვა", "უსაფრთხოება"],
        "color": "#34495E"
    },
    "Cleaning": {
        "id": 16,
        "keywords_en": ["cleaner", "cleaning", "housekeeper", "janitor", "maid"],
        "keywords_ge": ["დამლაგებელი", "დასუფთავება"],
        "color": "#95A5A6"
    },
    "Media/Publishing": {
        "id": 13,
        "keywords_en": ["journalist", "editor", "writer", "media", "publisher", "reporter", "camera", "video", "photographer"],
        "keywords_ge": ["ჟურნალისტი", "რედაქტორი", "მედია"],
        "color": "#8E44AD"
    },
    "Beauty/Fashion": {
        "id": 14,
        "keywords_en": ["stylist", "hairdresser", "beauty", "cosmetic", "makeup", "fashion", "nail", "spa", "massage"],
        "keywords_ge": ["სტილისტი", "პარიკმახერი", "კოსმეტიკა"],
        "color": "#FF69B4"
    },
    "Law": {
        "id": 7,
        "keywords_en": ["lawyer", "legal", "attorney", "jurist", "paralegal", "notary", "compliance"],
        "keywords_ge": ["იურისტი", "ადვოკატი", "ნოტარიუსი"],
        "color": "#2C3E50"
    },
    "Technical Staff": {
        "id": 18,
        "keywords_en": ["technician", "mechanic", "operator", "maintenance", "repair", "service", "installer"],
        "keywords_ge": ["ტექნიკოსი", "მექანიკოსი", "ოპერატორი"],
        "color": "#7F8C8D"
    },
    "Other": {
        "id": 9,
        "keywords_en": [],
        "keywords_ge": [],
        "color": "#BDC3C7"
    }
}


class JobClassifier:
    """Classifies jobs into categories based on title and content keywords"""

    def __init__(self):
        self.categories = CATEGORIES

    def classify(self, title_en: str = "", title_ge: str = "", body_en: str = "", body_ge: str = "") -> str:
        """Classify a job into a category based on title and body content"""
        # Combine all text for matching
        text_en = f"{title_en} {body_en}".lower()
        text_ge = f"{title_ge} {body_ge}"

        scores = defaultdict(int)

        for category, data in self.categories.items():
            if category == "Other":
                continue

            # Check English keywords
            for keyword in data["keywords_en"]:
                if keyword.lower() in text_en:
                    # Title matches are worth more
                    if keyword.lower() in title_en.lower():
                        scores[category] += 3
                    else:
                        scores[category] += 1

            # Check Georgian keywords
            for keyword in data["keywords_ge"]:
                if keyword in text_ge:
                    if keyword in title_ge:
                        scores[category] += 3
                    else:
                        scores[category] += 1

        if scores:
            # Return category with highest score
            return max(scores, key=scores.get)

        return "Other"

    def get_category_color(self, category: str) -> str:
        """Get the color for a category"""
        return self.categories.get(category, {}).get("color", "#BDC3C7")

    def get_all_categories(self) -> list:
        """Get all category names"""
        return list(self.categories.keys())


class MetricsDatabase:
    """Extended database for time series metrics storage"""

    def __init__(self, db_path: str = "data/jobs.db"):
        self.db_path = Path(db_path)
        self._init_metrics_tables()
        self.classifier = JobClassifier()

    def _init_metrics_tables(self):
        """Initialize additional tables for metrics"""
        with sqlite3.connect(self.db_path) as conn:
            conn.executescript("""
                -- Time series for daily metrics
                CREATE TABLE IF NOT EXISTS metrics_daily (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    metric_name TEXT NOT NULL,
                    metric_value REAL,
                    labels TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date, metric_name, labels)
                );

                -- Category assignments for jobs
                CREATE TABLE IF NOT EXISTS job_categories (
                    job_id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    confidence REAL DEFAULT 1.0,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES jobs(id)
                );

                -- Hourly snapshots for fine-grained data
                CREATE TABLE IF NOT EXISTS metrics_hourly (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    metric_name TEXT NOT NULL,
                    metric_value REAL,
                    labels TEXT,
                    UNIQUE(timestamp, metric_name, labels)
                );

                CREATE INDEX IF NOT EXISTS idx_metrics_daily_date ON metrics_daily(date);
                CREATE INDEX IF NOT EXISTS idx_metrics_daily_name ON metrics_daily(metric_name);
                CREATE INDEX IF NOT EXISTS idx_job_categories_cat ON job_categories(category);
            """)

    def classify_all_jobs(self):
        """Classify all jobs and store their categories"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Get all active jobs
            cursor.execute("""
                SELECT id, title_en, title_ge, body_en, body_ge
                FROM jobs WHERE status = 'active'
            """)

            jobs = cursor.fetchall()
            classified = 0

            for job in jobs:
                category = self.classifier.classify(
                    job['title_en'] or '',
                    job['title_ge'] or '',
                    job['body_en'] or '',
                    job['body_ge'] or ''
                )

                cursor.execute("""
                    INSERT OR REPLACE INTO job_categories (job_id, category, updated_at)
                    VALUES (?, ?, ?)
                """, (job['id'], category, datetime.now().isoformat()))
                classified += 1

            conn.commit()
            return classified

    def record_daily_snapshot(self):
        """Record daily metrics snapshot"""
        today = datetime.now().strftime('%Y-%m-%d')

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Total active jobs
            cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'")
            total_active = cursor.fetchone()[0]

            self._upsert_metric(cursor, today, 'jobs_total_active', total_active, '{}')

            # Jobs with salary
            cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active' AND has_salary = 1")
            with_salary = cursor.fetchone()[0]
            self._upsert_metric(cursor, today, 'jobs_with_salary', with_salary, '{}')

            # New jobs today
            cursor.execute("""
                SELECT COUNT(*) FROM jobs
                WHERE DATE(first_seen_at) = DATE('now', 'localtime') AND status = 'active'
            """)
            new_today = cursor.fetchone()[0]
            self._upsert_metric(cursor, today, 'jobs_new_today', new_today, '{}')

            # Jobs by category
            cursor.execute("""
                SELECT jc.category, COUNT(*) as cnt
                FROM job_categories jc
                JOIN jobs j ON j.id = jc.job_id
                WHERE j.status = 'active'
                GROUP BY jc.category
            """)

            for row in cursor.fetchall():
                labels = json.dumps({"category": row[0]})
                self._upsert_metric(cursor, today, 'jobs_by_category', row[1], labels)

            # Jobs by company (top 20)
            cursor.execute("""
                SELECT company, COUNT(*) as cnt
                FROM jobs
                WHERE status = 'active' AND company != ''
                GROUP BY company
                ORDER BY cnt DESC
                LIMIT 20
            """)

            for row in cursor.fetchall():
                labels = json.dumps({"company": row[0]})
                self._upsert_metric(cursor, today, 'jobs_by_company', row[1], labels)

            conn.commit()

    def _upsert_metric(self, cursor, date: str, name: str, value: float, labels: str):
        """Insert or update a metric"""
        cursor.execute("""
            INSERT OR REPLACE INTO metrics_daily (date, metric_name, metric_value, labels, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (date, name, value, labels, datetime.now().isoformat()))

    def get_time_series(self, metric_name: str, days: int = 30, labels_filter: dict = None) -> list:
        """Get time series data for a metric"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

            if labels_filter:
                labels_json = json.dumps(labels_filter)
                cursor.execute("""
                    SELECT date, metric_value
                    FROM metrics_daily
                    WHERE metric_name = ? AND date >= ? AND labels = ?
                    ORDER BY date
                """, (metric_name, start_date, labels_json))
            else:
                cursor.execute("""
                    SELECT date, metric_value
                    FROM metrics_daily
                    WHERE metric_name = ? AND date >= ? AND labels = '{}'
                    ORDER BY date
                """, (metric_name, start_date))

            return [{"date": row['date'], "value": row['metric_value']} for row in cursor.fetchall()]

    def get_category_time_series(self, days: int = 30) -> dict:
        """Get time series data for all categories"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

            cursor.execute("""
                SELECT date, metric_value, labels
                FROM metrics_daily
                WHERE metric_name = 'jobs_by_category' AND date >= ?
                ORDER BY date
            """, (start_date,))

            result = defaultdict(list)
            for row in cursor.fetchall():
                labels = json.loads(row['labels'])
                category = labels.get('category', 'Other')
                result[category].append({
                    "date": row['date'],
                    "value": row['metric_value']
                })

            return dict(result)

    def get_current_stats(self) -> dict:
        """Get current statistics for dashboard"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Total active
            cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'")
            total_active = cursor.fetchone()[0]

            # With salary
            cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active' AND has_salary = 1")
            with_salary = cursor.fetchone()[0]

            # VIP
            cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active' AND is_vip = 1")
            vip_count = cursor.fetchone()[0]

            # New today
            cursor.execute("""
                SELECT COUNT(*) FROM jobs
                WHERE DATE(first_seen_at) = DATE('now', 'localtime')
            """)
            new_today = cursor.fetchone()[0]

            # New this week
            cursor.execute("""
                SELECT COUNT(*) FROM jobs
                WHERE first_seen_at >= datetime('now', '-7 days')
            """)
            new_week = cursor.fetchone()[0]

            # By category
            cursor.execute("""
                SELECT jc.category, COUNT(*) as cnt
                FROM job_categories jc
                JOIN jobs j ON j.id = jc.job_id
                WHERE j.status = 'active'
                GROUP BY jc.category
                ORDER BY cnt DESC
            """)
            by_category = [{"category": row[0], "count": row[1]} for row in cursor.fetchall()]

            # Top companies
            cursor.execute("""
                SELECT company, COUNT(*) as cnt
                FROM jobs
                WHERE status = 'active' AND company != ''
                GROUP BY company
                ORDER BY cnt DESC
                LIMIT 10
            """)
            top_companies = [{"company": row[0], "count": row[1]} for row in cursor.fetchall()]

            return {
                "total_active": total_active,
                "with_salary": with_salary,
                "with_salary_pct": round(with_salary / total_active * 100, 1) if total_active > 0 else 0,
                "vip_count": vip_count,
                "new_today": new_today,
                "new_this_week": new_week,
                "by_category": by_category,
                "top_companies": top_companies,
                "timestamp": datetime.now().isoformat()
            }

    def export_prometheus_metrics(self) -> str:
        """Export metrics in Prometheus format"""
        stats = self.get_current_stats()
        lines = []

        # HELP and TYPE declarations
        lines.append("# HELP jobs_total_active Total number of active job listings")
        lines.append("# TYPE jobs_total_active gauge")
        lines.append(f"jobs_total_active {stats['total_active']}")

        lines.append("# HELP jobs_with_salary Number of jobs with salary information")
        lines.append("# TYPE jobs_with_salary gauge")
        lines.append(f"jobs_with_salary {stats['with_salary']}")

        lines.append("# HELP jobs_vip Number of VIP job listings")
        lines.append("# TYPE jobs_vip gauge")
        lines.append(f"jobs_vip {stats['vip_count']}")

        lines.append("# HELP jobs_new_today Jobs posted today")
        lines.append("# TYPE jobs_new_today gauge")
        lines.append(f"jobs_new_today {stats['new_today']}")

        lines.append("# HELP jobs_by_category Number of jobs per category")
        lines.append("# TYPE jobs_by_category gauge")
        for cat in stats['by_category']:
            safe_cat = cat['category'].replace(' ', '_').replace('/', '_')
            lines.append(f'jobs_by_category{{category="{safe_cat}"}} {cat["count"]}')

        lines.append("# HELP jobs_by_company Number of jobs per company")
        lines.append("# TYPE jobs_by_company gauge")
        for comp in stats['top_companies']:
            safe_comp = comp['company'].replace('"', '\\"')
            lines.append(f'jobs_by_company{{company="{safe_comp}"}} {comp["count"]}')

        return "\n".join(lines)

    def get_dashboard_data(self, days: int = 30) -> dict:
        """Get all data needed for the dashboard"""
        stats = self.get_current_stats()
        category_series = self.get_category_time_series(days)
        total_series = self.get_time_series('jobs_total_active', days)
        salary_series = self.get_time_series('jobs_with_salary', days)

        # Get category colors
        category_colors = {cat: data['color'] for cat, data in CATEGORIES.items()}

        return {
            "current": stats,
            "time_series": {
                "total_active": total_series,
                "with_salary": salary_series,
                "by_category": category_series
            },
            "category_colors": category_colors,
            "generated_at": datetime.now().isoformat()
        }


def generate_sample_historical_data(db: MetricsDatabase, days: int = 30):
    """Generate sample historical data for demo purposes"""
    import random

    base_date = datetime.now()

    with sqlite3.connect(db.db_path) as conn:
        cursor = conn.cursor()

        # Get current category distribution
        cursor.execute("""
            SELECT jc.category, COUNT(*) as cnt
            FROM job_categories jc
            JOIN jobs j ON j.id = jc.job_id
            WHERE j.status = 'active'
            GROUP BY jc.category
        """)
        current_cats = {row[0]: row[1] for row in cursor.fetchall()}

        cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'")
        current_total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active' AND has_salary = 1")
        current_salary = cursor.fetchone()[0]

        for i in range(days, 0, -1):
            date = (base_date - timedelta(days=i)).strftime('%Y-%m-%d')

            # Create realistic variations (trending upward toward current values)
            progress = (days - i) / days
            variance = random.uniform(0.85, 1.15)

            total = int(current_total * (0.7 + 0.3 * progress) * variance)
            salary = int(current_salary * (0.7 + 0.3 * progress) * variance)

            db._upsert_metric(cursor, date, 'jobs_total_active', total, '{}')
            db._upsert_metric(cursor, date, 'jobs_with_salary', salary, '{}')
            db._upsert_metric(cursor, date, 'jobs_new_today', random.randint(5, 25), '{}')

            for category, count in current_cats.items():
                cat_count = int(count * (0.7 + 0.3 * progress) * random.uniform(0.8, 1.2))
                labels = json.dumps({"category": category})
                db._upsert_metric(cursor, date, 'jobs_by_category', cat_count, labels)

        conn.commit()


if __name__ == "__main__":
    # Test the module
    db = MetricsDatabase()

    print("Classifying all jobs...")
    count = db.classify_all_jobs()
    print(f"Classified {count} jobs")

    print("\nRecording daily snapshot...")
    db.record_daily_snapshot()

    print("\nGenerating historical data for demo...")
    generate_sample_historical_data(db)

    print("\nCurrent stats:")
    stats = db.get_current_stats()
    print(json.dumps(stats, indent=2, default=str))

    print("\nPrometheus metrics:")
    print(db.export_prometheus_metrics())
