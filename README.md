# KAVACH — Industrial Safety Intelligence Platform

> **"The sensors worked. The data existed. The intelligence layer did not."**
> 
> June 8, 2026. Visakhapatnam Steel Plant. 3:57 PM — first explosion. 4:15 PM — fatal explosion. Nine workers dead. 18 minutes between warning and catastrophe.

KAVACH is a real-time industrial safety intelligence platform built on **Layer of Protection Analysis (LOPA)** — the IEC 61511 international process safety standard. It detects compound barrier failures before any single sensor trips. It is what VSP did not have on June 8.

---

## The Problem

Indian heavy industry loses 3 workers every day in registered factories alone. Across 7 major incidents analysed — VSP 2026, Sigachi 2025, LG Polymers 2020, NTPC Unchahar 2017, IOC Jaipur 2009 — the pattern is identical:

- The data existed
- The sensors were reading  
- The warnings were there
- **No system connected them into a compound risk picture before the fatality**

86% of these incidents had administrative control (PTW) failure. 70–93% of the dead were contract workers — invisible to every existing safety system. Zero of the 7 incidents were truly unwarned. The median detectable warning window: 2–4 hours.

KAVACH closes that gap.

---

## What Makes This Different

Every existing safety platform monitors **sensors** — individual threshold alarms that fire when one reading crosses a limit.

KAVACH monitors **barriers** — the five independent protection layers between normal operations and catastrophe, scored continuously, combined using the LOPA multiplicative formula.

```
Compound Risk = 100 × (1 − ∏(IPL health score / 100))
```

A score of 30 across five layers produces compound risk 83 — **critical** — while every individual sensor reads "acceptable." This is the Swiss Cheese alignment. This is what kills workers. This is what KAVACH detects.

---

## Screenshots

### Nominal State — Risk 54
![Nominal state - 3D plant view with IPL dials green](/screenshots/kavach-nominal.png)

*The real Visakhapatnam Steel Plant in 3D. Blast furnaces dominant. Coke oven batteries — the accident zone. Five IPL dials, all healthy. Compound risk: 54.*

### Critical Alert — Risk 97
![Critical alert state - red zones, edge lighting](/screenshots/kavach-issue.png)

*KAVACH detected compound failure at T+35 (15:35). Real fatal explosion: T+45 (15:45). Ten minutes of intervention time.*

### Safety Loop — Live Bow-Tie
![Safety loop with bow-tie visualization](/screenshots/kavach-exec.png)

*Live bow-tie: barrier width = real-time IPL health score. Execute Now — barrier restores, risk drops, intervention evidence-logged.*

### Simulation Sandbox
![Simulation sandbox - causal graph and privatisation stress scenario](/screenshots/kavachsandbox.png)

*Privatisation Stress Scenario: staffing 45%, maintenance 60%. Compound risk 95 — zero process anomaly. Purely organizational decisions.*

### Camera Intelligence — Live Person Detection
![Camera detection](/screenshots/kavach-camera.png)
*Live webcam feed with TensorFlow.js person detection. Unidentified person in hazard zone triggers immediate alert. Worker count feeds IPL-5 Human Factors score in real time.*

### QR Worker Identification
![QR identification](/screenshots/kavach-qr.png)
*QR scan at zone gate confirms worker identity instantly — name, employer, training status checked against zone hazard class. Minimum viable deployment: a printed QR and any smartphone.*

---

## Five Pillars

### 1 — Real-Time LOPA Engine
Five Independent Protection Layers scored continuously from live data. The compound risk formula recalculates every few seconds. When multiple barriers degrade simultaneously — even when no single sensor crosses its threshold — KAVACH fires.

| IPL | What It Monitors | Data Source |
|-----|-----------------|-------------|
| IPL-1 BPCS | Gas readings, pressure, temperature trend velocity | SCADA / OPC-UA historian |
| IPL-2 SIS | Proof test interval, bypass/override status | Maintenance records |
| IPL-3 PTW | PHSA completion, SIMOPS conflicts per OISD-STD-105 | Permit-to-work log |
| IPL-4 MECH | Overdue inspections, open critical work orders | CMMS / SAP PM |
| IPL-5 HF | Qualified operators vs. required, contractor training status | Shift roster + training DB |

### 2 — SIMOPS Conflict Engine
Detects prohibited simultaneous operations per **OISD-STD-105** — the actual Indian regulatory standard for work permit systems. Hot work within 30m of confined space entry. Ignition source in elevated flammable gas. Deterministic, explainable, directly mapped to Indian regulation.

### 3 — Contractor Workforce Visibility
Contract workers represent 70–93% of Indian industrial fatalities yet are invisible to every existing system. KAVACH's QR check-in gives every contractor a live digital identity: name, employer, training status verified against zone hazard class, time-in-zone. Evacuation list auto-generates on alert — including every contractor, by name.

### 4 — Live Bow-Tie + Intervention Executor
The IOGP-standard, Ministry of Steel SG-26 mandated bow-tie analysis — made live. Barrier width driven by real-time IPL health score. Three ranked interventions with projected compound risk after execution. Click Execute — barrier restores, risk drops, intervention evidence-logged automatically.

### 5 — Regulatory Evidence Auto-Preservation
Every alert auto-generates a timestamped evidence bundle: sensor readings, active permits, worker locations, officer decisions. Formatted for **DGFASLI/Factory Inspectorate submission under Factory Act Section 88**. The accountability layer Indian industry has never had.

---

## Simulation Sandbox

A hierarchical causal graph — three levels of causation:

```
Level 1 — Organisational (root causes)
  Staffing Ratio → PTW Compliance Rate → Safety Culture Index

Level 2 — Process/Equipment (intermediate barriers)  
  SIS Proof Test Interval → Gas Detector Calibration → Ladle Inspection Status

Level 3 — Operational/Real-time (immediate conditions)
  CO Gas Reading → Flammable Gas LEL → Ladle Pressure → Workers in Zone
```

Changes propagate downward through causal rules — change staffing ratio, watch it cascade into IPL-5, then into compound risk. Three presets:

- **VSP June 8, 2026 — Pre-Incident Conditions**: The exact organizational and process state 45 minutes before the real explosion
- **Best Practice Operations**: Full staffing, all proof tests current, zero conflicts. Compound risk: 18
- **Privatisation Stress Scenario**: VSP post-workforce-reduction conditions. Compound risk: 95 with zero process anomaly

Press **Run Forward** — watch the next 60 minutes simulate at 10× speed. Adjust variables. Prevent the accident.

---

## Camera Intelligence Layer

Live webcam feed → TensorFlow.js COCO-SSD person detection → worker count feeds IPL-5 in real time.

QR scan at zone gate → worker identity, training status, zone authorization verified instantly → worker dot appears on 3D plant map.

Demo the complete loop: camera detects unidentified person → "UNIDENTIFIED PERSON IN HAZARD ZONE" alert → scan QR → Bikash Mahato, Durga Enterprises, training EXPIRED → IPL-5 degrades → compound risk rises → alert fires.

---

## Technology Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript |
| 3D Visualization | React Three Fiber, Three.js r128, @react-three/drei |
| State Management | Zustand |
| Charts | Recharts |
| Computer Vision | TensorFlow.js COCO-SSD, jsQR |
| AI Copilot | Anthropic claude-sonnet-4-6 |
| Safety Engine | Real-time LOPA (IEC 61511), OISD-STD-105 SIMOPS rules |
| Ambient Systems | Web Audio API (programmatic), CSS edge lighting |

---

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/kavach.git
cd kavach

# Install
npm install

# Environment — add your Anthropic API key
echo "VITE_ANTHROPIC_API_KEY=your_key_here" > .env

# Run
npm run dev
```

Open `http://localhost:5173`

Press **LAUNCH REPLAY** to start the VSP incident scenario. Press **Space** to pause. Press **R** to reset.

---

## Data Architecture

All data in the prototype is simulated — statistically realistic sensor time-series based on real steel plant sensor physics. The integration architecture is designed for real deployment:

```
Simulation Mode (default)
    ↓ swap for real plant →
OPC-UA Client → Plant Historian (Siemens/ABB/Honeywell/Rockwell)
    Zero changes to plant control systems
    Read-only access
    Port 4840, standard protocol
```

Four integration layers:

```
Process Signals  →  OPC-UA / MQTT / Modbus TCP / Manual entry
Work Permits     →  ePTW REST API / Paper PTW OCR (Claude Vision)  
Workforce        →  QR check-in / RFID / Live camera CV
Equipment Health →  SAP PM / IBM Maximo / CMMS REST
```

---

## Deployment Path

**Phase 1 — 72 hours:** OPC-UA read-only connection + QR check-in + manual PTW entry. Any plant. Zero hardware changes. Full five-pillar compound risk monitoring live.

**Phase 2 — 30 days:** ePTW API + CMMS connector + RFID + multilingual safety briefings (Telugu, Hindi, Odia, Bengali).

**Phase 3 — 6 months:** Multi-plant. Same platform, JSON config per plant type. SAIL has 5 integrated steel plants. One licensing conversation, five deployments.

---

## The Research Foundation

Built on analysis of 7 major Indian industrial accidents (2009–2026), 137 deaths, structured against the LOPA/IEC 61511 framework:

| Incident | Year | Fatalities | Warning Gap |
|----------|------|-----------|-------------|
| VSP Visakhapatnam Steel Plant | 2026 | 9 | 18 minutes |
| Sigachi Industries, Telangana | 2025 | 46 | Hours |
| LG Polymers Styrene Leak, Vizag | 2020 | 13 | Days |
| NTPC Unchahar Boiler Explosion | 2017 | 45 | Hours |
| IOC Jaipur Vapour Cloud Explosion | 2009 | 11 | 75 minutes |
| Neyveli Boiler Explosion | 2020 | 6+ | Hours |
| IOC Hazira Welding Fire | 2013 | 3 | Minutes |

**Finding:** Zero of the 7 incidents were truly unwarned. Every fatality had a detectable compound precursor. KAVACH's mission: make those warnings actionable.

---

## Built For

**ET AI Hackathon 2.0** — Problem Statement 1: AI-Powered Industrial Safety Intelligence for Zero-Harm Operations

**By:** Chanikya Sai Nelapatla

---

> *Sensors tell you when something went wrong.*
> *Barriers tell you when something is about to go wrong.*
> *VSP had working sensors on June 8, 2026.*
> *Nine workers still died.*
