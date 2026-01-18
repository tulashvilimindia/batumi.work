"""
Jobs.ge Parser HTTP Server
REST API for triggering parses, getting jobs, analytics, and dashboard
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
from jobs_parser import JobsGeParser
from datetime import datetime
from pathlib import Path

# Global state
parsers = {}  # Cache parsers by region
is_running = False
metrics_db = None


def get_parser(region: str = "adjara") -> JobsGeParser:
    if region not in parsers:
        parsers[region] = JobsGeParser(region=region)
    return parsers[region]


def get_metrics_db():
    global metrics_db
    if metrics_db is None:
        from analytics import MetricsDatabase
        metrics_db = MetricsDatabase()
    return metrics_db


class APIHandler(BaseHTTPRequestHandler):
    def _send_json(self, data: dict, status: int = 200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, default=str).encode('utf-8'))

    def _send_html(self, html: str, status: int = 200):
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))

    def _send_text(self, text: str, status: int = 200, content_type: str = 'text/plain'):
        self.send_response(status)
        self.send_header('Content-Type', f'{content_type}; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(text.encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        global is_running

        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        region = query.get('region', ['adjara'])[0]

        try:
            if path == '/parse' or path == '/trigger':
                if is_running:
                    self._send_json({"status": "busy", "message": "Parser already running"}, 429)
                    return

                is_running = True
                try:
                    parser = get_parser(region)
                    result = parser.run()

                    # Auto-export new jobs
                    export_path = parser.export_for_website()

                    # Update metrics
                    db = get_metrics_db()
                    db.classify_all_jobs()
                    db.record_daily_snapshot()

                    self._send_json({
                        "status": "success",
                        **result,
                        "export_file": export_path
                    })
                finally:
                    is_running = False

            elif path == '/jobs':
                parser = get_parser(region)
                jobs = parser.db.get_active_jobs(region)
                self._send_json({
                    "region": region,
                    "count": len(jobs),
                    "jobs": jobs
                })

            elif path == '/jobs/new':
                parser = get_parser(region)
                jobs = parser.db.get_unexported_jobs(region)
                self._send_json({
                    "region": region,
                    "count": len(jobs),
                    "jobs": jobs
                })

            elif path == '/stats':
                parser = get_parser(region)
                stats = parser.get_analytics()
                self._send_json(stats)

            elif path == '/export':
                parser = get_parser(region)
                export_path = parser.export_for_website()
                if export_path:
                    self._send_json({"status": "success", "file": export_path})
                else:
                    self._send_json({"status": "no_data", "message": "No new jobs to export"})

            elif path == '/export/all':
                parser = get_parser(region)
                export_path = parser.export_all_active()
                self._send_json({"status": "success", "file": export_path})

            elif path == '/health':
                self._send_json({"status": "ok", "timestamp": datetime.now().isoformat()})

            elif path == '/regions':
                self._send_json({"regions": list(JobsGeParser.REGIONS.keys())})

            # ===== NEW DASHBOARD & METRICS ENDPOINTS =====

            elif path == '/dashboard' or path == '/':
                # Serve the dashboard HTML
                dashboard_path = Path("dashboard.html")
                if dashboard_path.exists():
                    self._send_html(dashboard_path.read_text(encoding='utf-8'))
                else:
                    # Generate dashboard on the fly
                    from dashboard import generate_dashboard_html
                    db = get_metrics_db()
                    db.classify_all_jobs()
                    db.record_daily_snapshot()
                    from analytics import generate_sample_historical_data
                    generate_sample_historical_data(db)
                    data = db.get_dashboard_data(days=30)
                    html = generate_dashboard_html(data)
                    self._send_html(html)

            elif path == '/metrics':
                # Prometheus-format metrics
                db = get_metrics_db()
                metrics = db.export_prometheus_metrics()
                self._send_text(metrics, content_type='text/plain')

            elif path == '/api/dashboard':
                # JSON data for dashboard
                days = int(query.get('days', [30])[0])
                db = get_metrics_db()
                data = db.get_dashboard_data(days=days)
                self._send_json(data)

            elif path == '/api/categories':
                # Category stats
                db = get_metrics_db()
                stats = db.get_current_stats()
                self._send_json({
                    "categories": stats['by_category'],
                    "timestamp": datetime.now().isoformat()
                })

            elif path == '/api/timeseries':
                # Time series data
                metric = query.get('metric', ['jobs_total_active'])[0]
                days = int(query.get('days', [30])[0])
                db = get_metrics_db()
                data = db.get_time_series(metric, days)
                self._send_json({
                    "metric": metric,
                    "days": days,
                    "data": data
                })

            else:
                self._send_json({
                    "service": "Jobs.ge Parser API v3.0 - With Analytics Dashboard",
                    "endpoints": {
                        "GET /": "Analytics dashboard (Grafana-style)",
                        "GET /dashboard": "Analytics dashboard",
                        "GET /parse?region=adjara": "Run parser and export new jobs",
                        "GET /jobs?region=adjara": "Get all active jobs",
                        "GET /jobs/new?region=adjara": "Get unexported jobs only",
                        "GET /stats?region=adjara": "Get job market statistics",
                        "GET /export?region=adjara": "Export new jobs to file",
                        "GET /export/all?region=adjara": "Export all active jobs",
                        "GET /regions": "List available regions",
                        "GET /metrics": "Prometheus-format metrics",
                        "GET /api/dashboard": "Dashboard JSON data",
                        "GET /api/categories": "Category statistics",
                        "GET /api/timeseries?metric=X&days=30": "Time series data",
                        "GET /health": "Health check"
                    },
                    "default_region": "adjara"
                })

        except Exception as e:
            import traceback
            traceback.print_exc()
            self._send_json({"status": "error", "message": str(e)}, 500)

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


def run_server(host: str = '127.0.0.1', port: int = 8080):
    server = HTTPServer((host, port), APIHandler)
    print(f"""
===================================================================
       Jobs.ge Parser API Server v3.0 - Analytics Dashboard
===================================================================
  Server: http://{host}:{port}
===================================================================
  Dashboard:
    /              - Grafana-style analytics dashboard
    /metrics       - Prometheus-format metrics endpoint
===================================================================
  API Endpoints:
    /parse         - Run parser + auto-export + update metrics
    /jobs          - Get all active jobs
    /stats         - Job market statistics
    /api/dashboard - Dashboard data (JSON)
    /api/categories - Category breakdown
    /api/timeseries - Historical time series
===================================================================
  Press Ctrl+C to stop
===================================================================
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER] Stopped")
        server.shutdown()


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='127.0.0.1')
    ap.add_argument('--port', type=int, default=8080)
    args = ap.parse_args()
    run_server(args.host, args.port)
