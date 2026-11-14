# Anshul Panigrahi

AI engineer building LLM products and tool-using agents. Vellore, India.

Information Technology undergraduate at VIT who ships AI products end to end: on-device speech, LLM analytics that still work without the model, multi-agent support systems with human approval gates. Co-inventor on three published Indian patent applications. Looking for AI engineering internships with product teams shipping LLM features, agents and tool use.

- Website: https://burntcookiedough.github.io/
- MCP server (ask your AI assistant about me): https://github.com/burntcookiedough/anshul-portfolio-mcp
- Resume (PDF): https://drive.google.com/file/d/1iVJAJnojFs2xtPHplfOZ0s6a-u1Kz-KO/view?usp=sharing
- Email: anshulpanigrahi3678@gmail.com
- GitHub: https://github.com/burntcookiedough
- LinkedIn: https://linkedin.com/in/anshul-panigrahi22
- Looking for: AI engineering internships: LLM features, agents and tool use, and the systems that keep them reliable

## Experience

### AI/ML Intern, Brandworks Technologies Private Limited
May 2026 to Jul 2026

- Engineered a nine-stage data-quality pipeline for 26,419 images across 8 fruit classes: label normalization, perceptual-hash leakage checks, annotation filtering and training-set balancing.
- Trained YOLOv8s for 120 epochs; 80.4% precision and 66.2% mAP@50 on 4,728 holdout images; diagnosed domain-shift failures on a separate 155-image synthetic webcam stress set.

## Open source

- Merged PR to repowise-dev/repowise (codebase intelligence for AI agents and humans over MCP, 8.1k stars), 2026-11-12: fix(update): read stored health data from a configured database. With the database configured through REPOWISE_DB_URL, four incremental loaders still checked for a repo-local .repowise/wiki.db that is absent by design, so every incremental update read no stored git metadata, callers or coverage. Gated them on the configured store instead; one regression test per loader fails on main and passes with the fix, and the 738 tests touching these loaders still pass. Fixes issue #2406. https://github.com/repowise-dev/repowise/pull/5399

## Projects

### Eve — Windows Dictation
ai product / speech · Faster-Whisper, Electron, TypeScript, Python, WebSocket

Hold a hotkey, speak, and your words land wherever you were typing. A shipped desktop app with offline speech recognition, a live overlay, searchable history and CPU/GPU fallback.

Why it matters: Getting the model, the desktop runtime, session state and release packaging to behave as one product.

- Repo: https://github.com/burntcookiedough/eve-windows-dictation
- Site: https://burntcookiedough.github.io/eve-windows-dictation/

### Customer Support Agents
agents / langgraph · LangGraph, RAG, SQLite, Python

A LangGraph system that classifies tickets, routes them to specialist agents, retrieves from a RAG store, remembers customers in SQLite and gates risky actions behind human approval.

Why it matters: A supervisor node checks every answer, and refunds or cancellations wait for a human.

- Repo: https://github.com/burntcookiedough/abc-customer-support-langgraph

### Stella — Health Analytics
llm product · FastAPI, React, DuckDB, Ollama

Health analytics over wearable exports: FastAPI, React + Vite, DuckDB, and an Ollama-backed LLM layer for chat and reports that degrades cleanly to metrics-only.

Why it matters: The LLM is a feature, not a dependency. The product still works when the model isn't there.

- Repo: https://github.com/burntcookiedough/Stella

### Cognitive Load-Aware Scheduler
human-aware systems · Python, Telemetry, Scheduling, Analytics

Routes work using both machine state and a live Cognitive Load Score from typing variance, idle time and context switches, with flow-state protection and a baseline comparison.

Why it matters: Optimises the human + machine system, not just the infrastructure. Patented.

- Repo: https://github.com/burntcookiedough/Cognitive-Load-Aware-Distributed-Task-Scheduler

### Real-Time Predictive Maintenance
ml systems / streaming · Kafka, Spark, Cassandra, PyTorch

Kafka, Spark, Cassandra, PyTorch and graph analytics across 5,000 simulated machines: streaming anomaly detection plus cascade-failure analysis and constrained mitigation.

Why it matters: Model output is wired into a live data path and downstream decisions, not left in a notebook.

Private repo · available on request

### Physically-Bounded Mode Discovery
unsupervised ml / research · HDBSCAN, scikit-learn, Python

HDBSCAN proposes operating regimes on NASA CMAPSS and CWRU while physics constraints reject implausible clusters.

Why it matters: A cluster isn't accepted because a metric likes it. It also has to make physical sense.

- Repo: https://github.com/burntcookiedough/Physical-Bounded-Multimodal-Mode-Discovery

### Veri-Dose
applied ml / patented · MobileNetV2, TFLite, Calibration, Python

Medication verification with a quantized MobileNetV2 that knows when it's unsure: low-confidence predictions go to a human instead of pretending certainty.

Why it matters: Calibrated confidence and a fallback path, built into the product. Patent IN202641027860 A1.

- App: https://github.com/burntcookiedough/Veridose
- ML pipeline: https://github.com/burntcookiedough/veridose-Ml

### SecureTorrent
security / ml · YARA, scikit-learn, Flask

Malware-aware torrent security: YARA rules, a hybrid ML detector, qBittorrent integration and an API test suite.

Why it matters: Signatures catch the known threats and the model covers the rest.

- Repo: https://github.com/burntcookiedough/SecureTorrent

## Published patent applications (co-inventor)

### Medication dispenser with on-device user authentication and medication verification
IN202641027860 A1 · filed 10.03.2026, published 20.03.2026 (journal 12/2026) · Intellectual Property Office, India · applicant: Vellore Institute of Technology
Inventors: Chemmalar Selvi G, Anshul Panigrahi, Parth Surendra Sharma

A pill dispenser that recognises the patient's face, releases only their dose, then checks the pill with an on-device classifier before it is taken. Nothing leaves the device.

- 627 KB INT8 MobileNetV2
- 2.97 ms inference on CPU
- Face to verified dose in under 5 s on a Raspberry Pi 4
- Full publication (PDF): https://burntcookiedough.github.io/patents/01/IN202641027860A1.pdf

### Cognitive load-aware distributed task scheduling using hardware-bound processing control and predictive task migration
IN202641088096 A1 · filed 19.07.2026, published 24.07.2026 (journal 30/2026) · Intellectual Property Office, India · applicant: Vellore Institute of Technology
Inventors: Senthil Kumar T, Shagun Khandelwal, Sarthak Singhal, Advika Pundir, Anshul Panigrahi

A scheduler that reads how hard you are concentrating from keyboard, mouse and app-switching patterns, then holds back, slows or moves disruptive work to other machines until you surface.

- Cognitive Load Score with no wearables or sensors
- Defers, throttles or migrates tasks across nodes
- Predicts focus breaches and moves work ahead of time
- Full publication (PDF): https://burntcookiedough.github.io/patents/02/IN202641088096A1.pdf

### Zero-trust physical enclave security using continuous biometric entropy and RF-based perimeter monitoring
IN202641067209 A1 · filed 29.05.2026, published 05.06.2026 (journal 23/2026) · Intellectual Property Office, India · applicant: Vellore Institute of Technology
Inventors: Thanga Mariappan L, Anshul Panigrahi, Aryan Saxena, Yash Bajpai

A workstation that stays unlocked only while a live pulse is present and no unknown radio is nearby. Lose either, and the session keys are destroyed on the spot.

- Session keys from live PPG pulse entropy, SHA-3
- Keys wiped when presence drops or an RF emitter appears
- Screen falls to static the moment a session ends
- Full publication (PDF): https://burntcookiedough.github.io/patents/03/IN202641067209A1.pdf

## Education

- B.Tech in Information Technology, Vellore Institute of Technology, Vellore, India (2023 to 2027 (expected)). CGPA 8.74/10.

## Skills

- Languages: Python, C++, SQL, TypeScript
- Applied AI: Context engineering, Prompt engineering, Structured outputs, LLM APIs, Ollama
- Agent tooling: Claude Code, Codex, OpenCode, Hermes Agent, LangGraph
- Machine learning: PyTorch, YOLO, OpenCV, Faster-Whisper, CUDA
- Backend and delivery: FastAPI, DuckDB, SQLite, Docker, GitHub Actions, Pytest

## Achievements

- 2nd place, IEEE CS Hackathon (Sept 2025): Co-developed SpineGuard in a 5-member team
- Finalist, Yantra Central Hackathon (Feb 2025): Fingerprint spoofing detection

## Certifications

- Building Agents with Agentic AI, IBM Career Education (Jul 2026)
- Getting Started with Deep Learning, NVIDIA Deep Learning Institute (Mar 2026)
- Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate, Oracle (Mar 2026)

Currently building: Hermes Agent + custom tool harness.

Last updated 2026-11-14.
