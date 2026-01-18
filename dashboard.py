"""
Jobs.ge Analytics Dashboard Generator
Creates Grafana-style HTML dashboard with dynamic charts
"""

import json
from datetime import datetime
from pathlib import Path
from analytics import MetricsDatabase, CATEGORIES


def generate_dashboard_html(data: dict) -> str:
    """Generate the complete dashboard HTML"""

    # Prepare data for charts
    category_data = data['time_series']['by_category']
    category_colors = data['category_colors']
    current = data['current']

    # Build category datasets for Chart.js
    category_datasets = []
    for category, series in category_data.items():
        if series:  # Only include categories with data
            color = category_colors.get(category, '#BDC3C7')
            category_datasets.append({
                "label": category,
                "data": [{"x": p["date"], "y": p["value"]} for p in series],
                "borderColor": color,
                "backgroundColor": color + "33",
                "fill": False,
                "tension": 0.4,
                "pointRadius": 2,
                "borderWidth": 2
            })

    # Sort by average value for better legend ordering
    category_datasets.sort(key=lambda x: sum(p["y"] for p in x["data"]) / max(len(x["data"]), 1), reverse=True)

    # Total jobs time series
    total_series = data['time_series'].get('total_active', [])
    salary_series = data['time_series'].get('with_salary', [])

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jobs.ge Analytics Dashboard - Batumi/Adjara</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-primary: #0b0c0e;
            --bg-secondary: #111217;
            --bg-panel: #181b1f;
            --bg-hover: #1f2229;
            --border-color: #2a2e37;
            --text-primary: #d8dee9;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
            --accent-blue: #58a6ff;
            --accent-green: #3fb950;
            --accent-orange: #d29922;
            --accent-red: #f85149;
            --accent-purple: #a371f7;
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
        }}

        .header {{
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-color);
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }}

        .header-left {{
            display: flex;
            align-items: center;
            gap: 16px;
        }}

        .logo {{
            display: flex;
            align-items: center;
            gap: 12px;
        }}

        .logo-icon {{
            width: 36px;
            height: 36px;
            background: var(--gradient-3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }}

        .logo-text {{
            font-size: 20px;
            font-weight: 600;
            background: linear-gradient(90deg, #58a6ff, #a371f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .region-badge {{
            background: var(--bg-panel);
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
        }}

        .header-right {{
            display: flex;
            align-items: center;
            gap: 16px;
        }}

        .last-update {{
            font-size: 12px;
            color: var(--text-muted);
        }}

        .refresh-btn {{
            background: var(--bg-panel);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }}

        .refresh-btn:hover {{
            background: var(--bg-hover);
            border-color: var(--accent-blue);
        }}

        .main-content {{
            padding: 24px;
            max-width: 1800px;
            margin: 0 auto;
        }}

        .stats-row {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}

        .stat-card {{
            background: var(--bg-panel);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }}

        .stat-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }}

        .stat-card.blue::before {{ background: var(--accent-blue); }}
        .stat-card.green::before {{ background: var(--accent-green); }}
        .stat-card.orange::before {{ background: var(--accent-orange); }}
        .stat-card.purple::before {{ background: var(--accent-purple); }}
        .stat-card.red::before {{ background: var(--accent-red); }}

        .stat-label {{
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }}

        .stat-value {{
            font-size: 32px;
            font-weight: 700;
            line-height: 1.2;
        }}

        .stat-value.blue {{ color: var(--accent-blue); }}
        .stat-value.green {{ color: var(--accent-green); }}
        .stat-value.orange {{ color: var(--accent-orange); }}
        .stat-value.purple {{ color: var(--accent-purple); }}
        .stat-value.red {{ color: var(--accent-red); }}

        .stat-change {{
            font-size: 12px;
            margin-top: 4px;
        }}

        .stat-change.up {{ color: var(--accent-green); }}
        .stat-change.down {{ color: var(--accent-red); }}

        .panels-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }}

        @media (max-width: 1200px) {{
            .panels-grid {{
                grid-template-columns: 1fr;
            }}
        }}

        .panel {{
            background: var(--bg-panel);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            overflow: hidden;
        }}

        .panel.full-width {{
            grid-column: 1 / -1;
        }}

        .panel-header {{
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .panel-title {{
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .panel-title-icon {{
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }}

        .panel-actions {{
            display: flex;
            gap: 8px;
        }}

        .panel-btn {{
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            transition: all 0.2s;
        }}

        .panel-btn:hover {{
            background: var(--bg-hover);
            color: var(--text-primary);
        }}

        .panel-btn.active {{
            background: var(--accent-blue);
            color: white;
        }}

        .panel-body {{
            padding: 20px;
            min-height: 300px;
        }}

        .chart-container {{
            position: relative;
            height: 280px;
        }}

        .category-legend {{
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
        }}

        .legend-item {{
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--text-secondary);
        }}

        .legend-color {{
            width: 12px;
            height: 3px;
            border-radius: 2px;
        }}

        .categories-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
        }}

        .category-item {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-secondary);
            border-radius: 8px;
            border-left: 3px solid;
        }}

        .category-name {{
            font-size: 13px;
            color: var(--text-secondary);
        }}

        .category-count {{
            font-size: 18px;
            font-weight: 600;
        }}

        .companies-list {{
            display: flex;
            flex-direction: column;
            gap: 8px;
        }}

        .company-item {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: var(--bg-secondary);
            border-radius: 6px;
        }}

        .company-name {{
            font-size: 13px;
            color: var(--text-primary);
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}

        .company-jobs {{
            font-size: 14px;
            font-weight: 600;
            color: var(--accent-blue);
        }}

        .bar-bg {{
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background: var(--accent-blue);
            opacity: 0.1;
            border-radius: 6px;
        }}

        .footer {{
            text-align: center;
            padding: 24px;
            color: var(--text-muted);
            font-size: 12px;
        }}

        .footer a {{
            color: var(--accent-blue);
            text-decoration: none;
        }}

        /* Gauge styles */
        .gauge-container {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }}

        .gauge {{
            position: relative;
            width: 200px;
            height: 100px;
        }}

        .gauge-bg {{
            position: absolute;
            width: 200px;
            height: 100px;
            border-radius: 100px 100px 0 0;
            background: var(--bg-secondary);
            overflow: hidden;
        }}

        .gauge-fill {{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--gradient-4);
            transform-origin: bottom center;
        }}

        .gauge-center {{
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 140px;
            height: 70px;
            background: var(--bg-panel);
            border-radius: 100px 100px 0 0;
        }}

        .gauge-value {{
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
        }}

        .gauge-number {{
            font-size: 28px;
            font-weight: 700;
            color: var(--accent-green);
        }}

        .gauge-label {{
            font-size: 11px;
            color: var(--text-muted);
        }}

        /* Mini sparkline */
        .sparkline {{
            display: flex;
            align-items: flex-end;
            gap: 2px;
            height: 30px;
        }}

        .spark-bar {{
            flex: 1;
            background: var(--accent-blue);
            border-radius: 2px 2px 0 0;
            opacity: 0.6;
            transition: opacity 0.2s;
        }}

        .spark-bar:hover {{
            opacity: 1;
        }}
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <div class="logo">
                <div class="logo-icon">📊</div>
                <span class="logo-text">Jobs.ge Analytics</span>
            </div>
            <span class="region-badge">Batumi / Adjara Region</span>
        </div>
        <div class="header-right">
            <span class="last-update">Last updated: <span id="lastUpdate">{data['generated_at'][:19].replace('T', ' ')}</span></span>
            <button class="refresh-btn" onclick="location.reload()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Refresh
            </button>
        </div>
    </header>

    <main class="main-content">
        <!-- Stats Cards Row -->
        <div class="stats-row">
            <div class="stat-card blue">
                <div class="stat-label">Total Active Jobs</div>
                <div class="stat-value blue">{current['total_active']}</div>
            </div>
            <div class="stat-card green">
                <div class="stat-label">New This Week</div>
                <div class="stat-value green">{current['new_this_week']}</div>
            </div>
            <div class="stat-card orange">
                <div class="stat-label">With Salary Info</div>
                <div class="stat-value orange">{current['with_salary']}</div>
                <div class="stat-change">{current['with_salary_pct']}% of total</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-label">VIP Listings</div>
                <div class="stat-value purple">{current['vip_count']}</div>
            </div>
            <div class="stat-card red">
                <div class="stat-label">Categories</div>
                <div class="stat-value red">{len([c for c in current['by_category'] if c['count'] > 0])}</div>
            </div>
        </div>

        <!-- Main Charts Grid -->
        <div class="panels-grid">
            <!-- Jobs by Category Over Time -->
            <div class="panel full-width">
                <div class="panel-header">
                    <span class="panel-title">
                        <span class="panel-title-icon" style="background: var(--accent-blue)"></span>
                        Jobs by Category - Time Series
                    </span>
                    <div class="panel-actions">
                        <button class="panel-btn active" onclick="setTimeRange(7)">7d</button>
                        <button class="panel-btn" onclick="setTimeRange(14)">14d</button>
                        <button class="panel-btn" onclick="setTimeRange(30)">30d</button>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Total Jobs Trend -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">
                        <span class="panel-title-icon" style="background: var(--accent-green)"></span>
                        Total Jobs Trend
                    </span>
                </div>
                <div class="panel-body">
                    <div class="chart-container">
                        <canvas id="totalChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Salary Info Trend -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">
                        <span class="panel-title-icon" style="background: var(--accent-orange)"></span>
                        Jobs with Salary Information
                    </span>
                </div>
                <div class="panel-body">
                    <div class="chart-container">
                        <canvas id="salaryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Category Distribution -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">
                        <span class="panel-title-icon" style="background: var(--accent-purple)"></span>
                        Current Category Distribution
                    </span>
                </div>
                <div class="panel-body">
                    <div class="chart-container">
                        <canvas id="categoryPieChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Top Companies -->
            <div class="panel">
                <div class="panel-header">
                    <span class="panel-title">
                        <span class="panel-title-icon" style="background: var(--accent-red)"></span>
                        Top Hiring Companies
                    </span>
                </div>
                <div class="panel-body">
                    <div class="companies-list">
                        {"".join([f'''
                        <div class="company-item" style="position: relative;">
                            <div class="bar-bg" style="width: {(c['count'] / current['top_companies'][0]['count'] * 100) if current['top_companies'] else 0}%"></div>
                            <span class="company-name">{c['company'][:30]}</span>
                            <span class="company-jobs">{c['count']}</span>
                        </div>
                        ''' for c in current['top_companies'][:8]])}
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        <p>Jobs.ge Analytics Dashboard | Data from <a href="https://jobs.ge" target="_blank">jobs.ge</a> | Generated {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </footer>

    <script>
        // Chart.js configuration
        Chart.defaults.color = '#8b949e';
        Chart.defaults.borderColor = '#2a2e37';
        Chart.defaults.font.family = 'Inter, sans-serif';

        // Category time series data
        const categoryDatasets = {json.dumps(category_datasets)};

        // Total jobs data
        const totalData = {json.dumps([{"x": p["date"], "y": p["value"]} for p in total_series])};
        const salaryData = {json.dumps([{"x": p["date"], "y": p["value"]} for p in salary_series])};

        // Category colors for pie chart
        const categoryColors = {json.dumps(category_colors)};
        const categoryStats = {json.dumps(current['by_category'])};

        // Main category chart - stacked area for better visibility
        // Prepare datasets with fill and stacking
        const stackedDatasets = categoryDatasets.map((ds, idx) => ({{
            ...ds,
            fill: idx === 0 ? 'origin' : '-1',
            backgroundColor: ds.borderColor + '66',
            borderWidth: 1,
            pointRadius: 0
        }}));

        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        const categoryChart = new Chart(categoryCtx, {{
            type: 'line',
            data: {{
                datasets: stackedDatasets
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {{
                    mode: 'index',
                    intersect: false
                }},
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{
                            boxWidth: 12,
                            padding: 10,
                            font: {{ size: 10 }},
                            usePointStyle: true
                        }}
                    }},
                    tooltip: {{
                        backgroundColor: '#1f2229',
                        titleColor: '#d8dee9',
                        bodyColor: '#8b949e',
                        borderColor: '#2a2e37',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {{
                            title: function(items) {{
                                return items[0].raw.x;
                            }},
                            label: function(context) {{
                                return context.dataset.label + ': ' + context.raw.y + ' jobs';
                            }}
                        }}
                    }}
                }},
                scales: {{
                    x: {{
                        type: 'time',
                        time: {{
                            unit: 'day',
                            displayFormats: {{
                                day: 'MMM d'
                            }}
                        }},
                        grid: {{
                            display: false
                        }}
                    }},
                    y: {{
                        stacked: true,
                        beginAtZero: true,
                        grid: {{
                            color: '#2a2e37'
                        }},
                        ticks: {{
                            callback: function(value) {{ return value + ' jobs'; }}
                        }}
                    }}
                }}
            }}
        }});

        // Total jobs chart - bar chart to differentiate from salary
        const totalCtx = document.getElementById('totalChart').getContext('2d');
        new Chart(totalCtx, {{
            type: 'bar',
            data: {{
                datasets: [{{
                    label: 'Total Jobs',
                    data: totalData,
                    backgroundColor: 'rgba(63, 185, 80, 0.7)',
                    borderColor: '#3fb950',
                    borderWidth: 1,
                    borderRadius: 4
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }},
                    title: {{
                        display: true,
                        text: 'Range: ' + Math.min(...totalData.map(d => d.y)).toFixed(0) + ' - ' + Math.max(...totalData.map(d => d.y)).toFixed(0) + ' jobs',
                        color: '#8b949e',
                        font: {{ size: 11 }}
                    }}
                }},
                scales: {{
                    x: {{
                        type: 'time',
                        time: {{ unit: 'day', displayFormats: {{ day: 'MMM d' }} }},
                        grid: {{ display: false }}
                    }},
                    y: {{
                        beginAtZero: false,
                        grid: {{ color: '#2a2e37' }},
                        ticks: {{
                            callback: function(value) {{ return value + ' jobs'; }}
                        }}
                    }}
                }}
            }}
        }});

        // Salary chart - area chart with different style
        const salaryCtx = document.getElementById('salaryChart').getContext('2d');
        new Chart(salaryCtx, {{
            type: 'line',
            data: {{
                datasets: [{{
                    label: 'With Salary',
                    data: salaryData,
                    borderColor: '#d29922',
                    backgroundColor: 'rgba(210, 153, 34, 0.3)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#d29922',
                    borderWidth: 2
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }},
                    title: {{
                        display: true,
                        text: 'Range: ' + Math.min(...salaryData.map(d => d.y)).toFixed(0) + ' - ' + Math.max(...salaryData.map(d => d.y)).toFixed(0) + ' jobs with salary',
                        color: '#8b949e',
                        font: {{ size: 11 }}
                    }}
                }},
                scales: {{
                    x: {{
                        type: 'time',
                        time: {{ unit: 'day', displayFormats: {{ day: 'MMM d' }} }},
                        grid: {{ display: false }}
                    }},
                    y: {{
                        beginAtZero: true,
                        max: Math.max(...salaryData.map(d => d.y)) * 1.2,
                        grid: {{ color: '#2a2e37' }},
                        ticks: {{
                            callback: function(value) {{ return value + ' jobs'; }}
                        }}
                    }}
                }}
            }}
        }});

        // Category pie chart
        const pieCtx = document.getElementById('categoryPieChart').getContext('2d');
        new Chart(pieCtx, {{
            type: 'doughnut',
            data: {{
                labels: categoryStats.map(c => c.category),
                datasets: [{{
                    data: categoryStats.map(c => c.count),
                    backgroundColor: categoryStats.map(c => categoryColors[c.category] || '#BDC3C7'),
                    borderWidth: 0
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'right',
                        labels: {{
                            boxWidth: 12,
                            padding: 8,
                            font: {{ size: 10 }}
                        }}
                    }}
                }},
                cutout: '60%'
            }}
        }});

        // Time range filter
        function setTimeRange(days) {{
            document.querySelectorAll('.panel-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            // In a real implementation, this would reload data with the new time range
            console.log('Setting time range to', days, 'days');
        }}
    </script>
</body>
</html>'''

    return html


def generate_dashboard(output_path: str = "dashboard.html"):
    """Generate the dashboard HTML file"""
    db = MetricsDatabase()

    # Classify jobs and record metrics
    print("[DASHBOARD] Classifying jobs...")
    count = db.classify_all_jobs()
    print(f"[DASHBOARD] Classified {count} jobs")

    print("[DASHBOARD] Recording daily snapshot...")
    db.record_daily_snapshot()

    # Generate sample historical data if needed
    from analytics import generate_sample_historical_data
    print("[DASHBOARD] Generating historical data...")
    generate_sample_historical_data(db)

    # Get dashboard data
    print("[DASHBOARD] Fetching dashboard data...")
    data = db.get_dashboard_data(days=30)

    # Generate HTML
    print("[DASHBOARD] Generating HTML...")
    html = generate_dashboard_html(data)

    # Write to file
    output = Path(output_path)
    output.write_text(html, encoding='utf-8')

    print(f"[DASHBOARD] Dashboard generated: {output.absolute()}")
    return str(output.absolute())


if __name__ == "__main__":
    generate_dashboard()
