HomePageDashboardIdeas.md
Great timing to learn about dashboards! Port's Home page is fully customizable with widgets. Here are ideas tailored to your catalog:

🎯 Recommended Dashboard Layout for Your Catalog:
Row 1: High-Level Overview (Personal + Quick Stats)
My Entities (Personal Widget)

Shows services/repos you own or are assigned to
Great for quick access to your work
Total Services by Type (Pie Chart)

Visualize distribution: web-app, game, tool, platform, etc.
Uses your type property with those nice colors you set up!
Services by Lifecycle (Pie Chart)

Active vs Maintained vs Archived
Quick health check of your portfolio
Row 2: Security & Quality Metrics
Critical Vulnerabilities (Number Widget - Red Alert)

Count of open_critical_vulnerabilities across all services
Set condition to turn red if > 0
High Vulnerabilities (Number Widget - Orange Warning)

Count of open_high_vulnerabilities
Shows security posture at a glance
Fixes This Month (Number Widget - Green Success)

Shows fixes_in_the_last_30_days
Celebrate progress!
Scorecard Health (Pie Chart)

Distribution of scorecard levels (Gold/Silver/Bronze/Basic)
Across your security-maturity scorecard
Row 3: Repository Activity
Recently Updated Repos (Table Widget)

Show repos sorted by last_push
Columns: Name, Language, Last Contributor, Last Push
Quick view of active development
Repos by Language (Pie Chart)

Distribution of programming languages
See your tech stack diversity
Row 4: Quick Actions & Recent Activity
Recently Used Actions (Personal Widget)

Your recent action runs
Quick re-run access
Recently Viewed (Personal Widget)

Entities you've looked at recently
Fast navigation
📊 Specific Widget Examples for Your Data:
1. Security Alert Number Widget

Type: Number Chart
Chart Type: Aggregate by property
Blueprint: service
Property: open_critical_vulnerabilities
Function: sum
Title: 🔴 Critical Vulnerabilities
Unit: none
Condition: 
  - If value > 0: Red, "Action Required"
  - If value = 0: Green, "All Clear"
2. Service Type Distribution

Type: Pie Chart
Blueprint: service
Property: type
Title: Services by Type
Description: Distribution across web-app, game, tool, etc.
3. Active Services Table

Type: Table Explorer
Blueprint: service
Filters: lifecycle = "active"
Columns: 
  - Title
  - Type
  - Tech Stack
  - URL
  - Open Critical Vulnerabilities
  - Open High Vulnerabilities
Title: Active Services Overview
4. Scorecard Progress

Type: Number Chart
Chart Type: Count entities
Blueprint: service
Filters: scorecard.security-maturity.level = "Gold"
Title: 🏆 Gold Standard Services
Description: Services achieving Gold security maturity
5. Monthly Fix Velocity

Type: Number Chart
Chart Type: Aggregate by property
Blueprint: service
Property: fixes_in_the_last_30_days
Function: sum
Title: 🛠️ Fixes This Month
Unit: custom ("vulnerabilities fixed")
🎨 How to Add Widgets (UI):
Go to Home Page
Click "+ Widget" button (top right)
Choose widget type:
Personal → My Entities, Recently Viewed, Recently Used Actions
Data → Pie Chart, Number Chart, Table Explorer
Custom → Markdown, iFrame, Action
Configure the widget with your blueprint and properties
Drag to arrange layout
Resize by dragging corners
💡 Learning Path Suggestions:
Week 1: Start Simple

Add 3 personal widgets (My Entities, Recently Viewed, Recently Used Actions)
Add 1 pie chart (Services by Type)
Add 1 number widget (Total Services count)
Week 2: Add Security Focus

Critical/High vulnerability number widgets
Security scorecard distribution pie chart
Table of services with open vulnerabilities
Week 3: Advanced Visualizations

Time-series charts (if you add more time-based data)
Custom markdown widget with your catalog guide
Action widgets for common workflows
Week 4: Refinement

Add filters to focus on what matters
Set up color conditions for alerts
Create additional dashboard pages for specific views
🔗 Useful Links:
Dashboard Overview
Data Widgets Guide
Personal Widgets
Your Home Page
🚀 Next Steps:
Fix the hanging action:

Check GitHub Actions logs at https://github.com/bmccall17/repOptics/actions
Verify workflow has proper Port status reporting
Share the workflow file if you need help debugging
Start with Home dashboard:

Add 2-3 personal widgets first (easiest!)
Add one pie chart for service types
Add one number widget for total services
Experiment and iterate!
Want me to help you:

Debug the specific workflow file?
Create a specific widget configuration?
Set up a complete dashboard layout?
Let me know what you'd like to tackle first! 🎯

