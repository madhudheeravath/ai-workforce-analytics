# 📸 SheDev Portfolio Image Creation Guide

This guide helps you capture and create all the images needed for the portfolio.

## 🎯 Required Images Checklist

### 1. Hero Image (`hero_shedev.png`)
**What**: Main dashboard landing page  
**Where**: Dashboard home after login  
**Size**: 1920x1080  
**How to capture**:
1. Login to https://awap-next-app.onrender.com
2. Navigate to main dashboard
3. Show all key sections visible (KPIs, charts, navigation)
4. Use browser screenshot tool (F12 > Device mode > Screenshot)

**What to include**:
- SheDev logo/branding
- Navigation sidebar
- KPI cards prominently displayed
- At least one chart visible
- Clean, professional appearance

---

### 2. Architecture Diagram (`arch_diagram.jpeg`)
**What**: System architecture showing all components  
**Tool**: Draw.io, Lucidchart, or Excalidraw  
**Size**: 1600x1000 minimum

**Components to include**:
```
┌─────────────────────────────────────────────┐
│          Browser / Client                    │
│  (Next.js Frontend + Recharts Visualizations)│
└──────────────┬──────────────────────────────┘
               │ HTTPS
               ▼
┌──────────────────────────────────────────────┐
│       Next.js Application Layer              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │  API Routes  │  │  NextAuth.js       │   │
│  │  (REST)      │  │  Authentication    │   │
│  └──────┬───────┘  └─────────┬──────────┘   │
└─────────┼────────────────────┼───────────────┘
          │                    │
          ▼                    ▼
┌──────────────────────────────────────────────┐
│       Neon PostgreSQL Database               │
│  ┌─────────────────┐  ┌──────────────────┐  │
│  │ survey_data     │  │ users & roles    │  │
│  │ industry_bench  │  │ audit_logs       │  │
│  │ research_refs   │  │ admin_settings   │  │
│  └─────────────────┘  └──────────────────┘  │
└──────────────┲───────────────────────────────┘
               ▲
               │
┌──────────────┴───────────────────────────────┐
│       Python ETL Pipeline                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Clean    │→ │ Validate │→ │ Load      │  │
│  │ Data     │  │ & Transform│  │ to DB    │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│  Source: CSV files (survey, benchmarks)      │
└──────────────────────────────────────────────┘
```

**Color scheme**:
- Frontend: Blue (#3B82F6)
- Backend: Green (#10B981)
- Database: Purple (#8B5CF6)
- ETL: Orange (#F59E0B)

---

### 3. Data Flow Diagram (`data_flow.png`)
**What**: Step-by-step data journey  
**Tool**: Draw.io or Lucidchart  
**Size**: 1800x800

**Flow stages**:
```
CSV Upload → Python Cleaning → Validation → PostgreSQL → API Routes → Dashboard
   ↓              ↓               ↓            ↓            ↓           ↓
Raw Data    Normalized     Quality      Secure      JSON        Charts
            Deduplicated   Checks       Storage     Responses   & Tables
```

---

### 4. ERD (`erd_shedev.png`)
**What**: Database entity relationship diagram  
**Tool**: dbdiagram.io or draw.io  
**Size**: 1400x1000

**Tables to include**:
```
┌─────────────────────────┐
│ survey_respondents      │
├─────────────────────────┤
│ id (PK)                 │
│ age_group               │
│ company_size            │
│ job_role                │
│ industry_sector (FK)    │
│ is_ai_user              │
│ ai_comfort_level        │
│ productivity_change     │
│ is_excited, is_worried  │
└───────────┬─────────────┘
            │
            │ Many-to-One
            ▼
┌─────────────────────────┐
│ industry_benchmarks     │
├─────────────────────────┤
│ sector_id (PK)          │
│ sector_name             │
│ avg_adoption_rate       │
│ avg_sentiment_score     │
│ wage_premium            │
│ automation_risk         │
└─────────────────────────┘

┌─────────────────────────┐
│ users                   │
├─────────────────────────┤
│ id (PK)                 │
│ email                   │
│ role                    │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│ research_references     │
├─────────────────────────┤
│ id (PK)                 │
│ citation                │
│ source_type             │
│ key_finding             │
└─────────────────────────┘
```

---

### 5. KPI Cards (`kpi_cards.png`)
**What**: Dashboard KPI overview section  
**Where**: Top of main dashboard  
**Size**: 1600x400

**Capture**: The row of KPI cards showing:
- AI Adoption Rate (%)
- Productivity Change (%)
- Training Participation (%)
- Average Comfort Level (1-7)
- Sentiment Score

**Tips**:
- Zoom in to make numbers clearly visible
- Include icons if present
- Show trend indicators (up/down arrows)

---

### 6. Adoption by Size (`adoption_by_size.png`)
**What**: Bar chart showing AI adoption by company size  
**Where**: Dashboard → Demographics section  
**Size**: 1200x800

**Chart should show**:
- X-axis: Company sizes (Micro, Small, Medium, Large)
- Y-axis: Adoption percentage
- Clear bars with different colors
- Data labels on bars

---

### 7. Adoption by Role (`AI_Adoption_by_Job_Role.png`)
**What**: Chart showing adoption rates across job roles  
**Where**: Dashboard → Role analysis  
**Size**: 1200x800

**Roles to show**:
- Executives
- Managers
- Analysts
- Technical Staff
- Clerical/Support
- Skilled Trades

---

### 8. Productivity Impact (`Productivity_Impact_by_Industry.png`)
**What**: Bar/column chart by industry sector  
**Where**: Dashboard → Productivity section  
**Size**: 1400x800

**Industries**:
- Technology
- Finance
- Healthcare
- Education
- Manufacturing
- Retail
- Construction

---

### 9. ROI Heatmap (`roi_heatmap.png`)
**What**: 2D heatmap showing adoption vs. productivity  
**Where**: Dashboard → ROI analysis  
**Size**: 1200x800

**Axes**:
- X: AI Adoption Rate
- Y: Productivity Change
- Color intensity: ROI score (red = high, yellow = medium, green = low)

**Tips**:
- Use clear color gradient
- Include legend explaining colors
- Mark high-ROI clusters

---

## 🎨 General Screenshot Tips

### Before Capturing
1. **Clean the UI**: Remove any test data or errors
2. **Maximize window**: Full screen for best quality
3. **Check spelling**: No typos visible
4. **Consistent theme**: Use the same color scheme across all shots

### During Capture
- Use browser DevTools (F12) for precise viewport sizing
- Enable "Device Toolbar" for exact dimensions
- Use "Capture screenshot" or "Capture full size screenshot"

### After Capture
1. **Crop**: Remove unnecessary browser chrome
2. **Optimize**: Use TinyPNG or similar to reduce file size
3. **Rename**: Use descriptive names matching the guide
4. **Place**: Save to `Portfolio/images/` folder

---

## 🛠️ Tools Needed

### For Screenshots
- **Browser**: Chrome/Edge DevTools
- **OS Tools**: Windows Snipping Tool, macOS Screenshot
- **Extensions**: Full Page Screen Capture, Awesome Screenshot

### For Diagrams
- **Free**: Draw.io, Excalidraw
- **Paid**: Lucidchart, Figma
- **Database ERD**: dbdiagram.io, SQL Designer

### For Editing
- **Simple edits**: Paint.NET, GIMP, Photopea
- **Professional**: Adobe Photoshop, Figma
- **Optimization**: TinyPNG, ImageOptim

---

## ✅ Final Checklist

Before considering images complete:

- [ ] All 9 images created and saved
- [ ] Images are high resolution (minimum specs met)
- [ ] File sizes optimized (<500KB each when possible)
- [ ] Filenames match exactly as listed in Portfolio.md
- [ ] No personal/sensitive information visible
- [ ] Colors are consistent across related images
- [ ] Text is readable at 100% zoom
- [ ] Images placed in `Portfolio/images/` folder
- [ ] Portfolio.md renders correctly with all images showing

---

## 🚀 Quick Start

1. **Take screenshots**: Start with live dashboard at https://awap-next-app.onrender.com
2. **Create diagrams**: Use Draw.io for architecture and ERD
3. **Edit & optimize**: Crop, resize, optimize file size
4. **Save & test**: Place in images folder and preview Portfolio.md

---

*Part of the SheDev AI Workforce Analytics Platform*
