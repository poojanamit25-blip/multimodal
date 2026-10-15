# ⚡ KODEXIS

### AI Technical Interview Intelligence & Multi-Factor Coding Assessment Sandbox

[![Java 21](https://img.shields.io/badge/Java-21-orange?style=flat&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.2-brightgreen?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat&logo=render)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)

> **"Don't just write code. Prove how you think."**

**KODEXIS** is an AI-powered technical interview simulation, live coding execution sandbox, and multi-factor proficiency assessment platform. Built for modern software engineering hiring and candidate upskilling, it combines a **Monaco-based IDE**, an **isolated Docker sandbox runtime**, **anti-cheat proctoring**, a **Socratic AI tutor**, and a **Bayesian Knowledge Tracing (BKT)** engine.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Core Platform Features](#-core-platform-features)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Prerequisites & Environment Setup](#-prerequisites--environment-setup)
6. [Local Quickstart](#-local-quickstart)
   - [Running the Spring Boot Backend](#1-running-the-spring-boot-backend)
   - [Running the React Frontend](#2-running-the-react-frontend)
   - [Running the Standalone Mock Server](#3-running-the-standalone-mock-server-alternative)
7. [REST API Documentation](#-rest-api-documentation)
8. [Deployment Guide](#-deployment-guide)
   - [Deploying to Render (Blueprint)](#deploying-to-render-blueprint)
   - [Deploying to Vercel (Frontend)](#deploying-to-vercel-frontend)
   - [Docker Containerization](#docker-containerization)
9. [Default Demo Credentials](#-default-demo-credentials)
10. [Testing & Quality Verification](#-testing--quality-verification)

---

## 🏛️ Architectural Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KODEXIS CLIENT                                 │
│         React 19 + TypeScript + Vite + Tailwind CSS + Monaco Editor         │
│  - Interactive IDE & Terminal  - 9-Factor Radar Analytics  - Socratic Tutor │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │ REST / JWT                    │ Direct Fallback
                       ▼                               ▼
┌─────────────────────────────────────────┐  ┌────────────────────────────────┐
│         KODEXIS BACKEND (JVM)           │  │      EXTERNAL SERVICES         │
│  Spring Boot 3.3.2 / Java 21 / Security │  │                                │
│  - Multi-Factor Assessment Engine       │  │  - Piston Code Execution API   │
│  - Bayesian Knowledge Tracing (BKT)     │  │    (EMKC Isolated Sandbox)     │
│  - Knowledge Ingestion & RAG Pipeline   │  │  - Mistral AI / NVIDIA NIM API │
│  - Persistent H2 / PostgreSQL Storage   │  │    (Conversational Brain)      │
└─────────────────────────────────────────┘  └────────────────────────────────┘
```

---

## 🌟 Core Platform Features

### 1. Monaco Code Editor & Live Execution Sandbox
- Full Monaco-powered code editor with support for **Java, Python, C++, C, and JavaScript**.
- Instant compilation and execution against both public and hidden test cases powered by the **Piston API**.
- Custom standard input (stdin) testing console with live STDOUT and STDERR stream inspection.

### 2. Multi-Factor Coding Proficiency Assessment Framework
Evaluates candidate solutions across 9 holistic dimensions with weighted scoring:
- **Code Correctness (30%)**: Exact pass-rate percentage across public and edge test suites.
- **Problem Solving (20%)**: Optimal algorithm design vs brute-force detection.
- **Complexity Optimization (15%)**: Automated asymptotic estimation ($O(1)$, $O(N)$, $O(N \log N)$, $O(N^2)$) for runtime and memory.
- **Code Quality & Modularity (10%)**: Cyclomatic complexity, naming conventions, and clean code hygiene.
- **Edge-Case Resilience (10%)**: Handling of empty inputs, negative numbers, overflow boundaries, and singletons.
- **Debugging Efficiency (10%)**: Speed and iteration count from compilation errors to valid solutions.
- **Communication & Logic (5%)**: Socratic conceptual explanations and architectural justification.

### 3. Anti-Cheat Proctoring & Infraction Auditing
- Tracks window focus loss and browser tab-switching telemetry during interview sessions.
- Automatically calculates proctoring penalties and logs suspicious actions into the interview autopsy timeline.

### 4. Socratic AI Interviewer & Knowledge Hub (RAG)
- Conversational AI interviewer that probes candidates on algorithm trade-offs, edge cases, and time/space constraints.
- Multi-lingual tutoring support (**English, Hindi, and Hinglish**).
- Grounded document citations with page/slide mapping for course materials.

### 5. Bayesian Knowledge Tracing (BKT) & Learner DAG
- Dynamic Directed Acyclic Graph (DAG) visualizing concept mastery and prerequisite topics.
- Cold-start baseline assessment with adaptive diagnostic quizzes that adjust difficulty in real-time.

### 6. Study Calendar & Targeted Revision Studio
- Personalized automated study plans targeting diagnostic weak points.
- Interactive flashcards, spaced repetition reminders, and weakness-loop alert trackers.

---

## 💻 Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.2
- **Security**: Spring Security 6 with stateless JWT authentication (`jjwt 0.12.5`)
- **Database**: Embedded Persistent H2 (PostgreSQL compatibility mode) / PostgreSQL
- **ORM**: Spring Data JPA / Hibernate

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8, Oxlint
- **Styling**: Tailwind CSS 3.4, PostCSS, Framer Motion
- **Code Editor**: `@monaco-editor/react` (VS Code engine)
- **Charts & Visualizations**: Recharts 2.15, Lucide Icons, Spline 3D Runtime

### Integrations & Services
- **AI Models**: Mistral AI API (`open-mistral-7b`) / NVIDIA NIM (`llama-3.1-nemotron-70b-instruct`) with deterministic offline fallback.
- **Sandbox Engine**: Piston Remote Sandbox (`https://emkc.org/api/v2/piston/execute`).

---

## 📂 Project Structure

```
Kodexis/
├── backend/                              # Spring Boot Java 21 Backend
│   ├── src/main/java/com/kodexis/core/
│   │   ├── ai/                          # Mistral AI / LLM Integration
│   │   ├── controller/                  # REST Controllers (Auth, Interview, Progress, Admin)
│   │   ├── db/                          # Database Seed Initializer (DataInitializer)
│   │   ├── learning/                    # Learning Hub (BKT, RAG, Ingestion, Calendar)
│   │   ├── model/                       # JPA Entities (User, Session, Assessment, etc.)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── sandbox/                     # Piston Remote Sandbox Execution Service
│   │   ├── security/                    # JWT Filter, Token Service, Security Config
│   │   └── service/                     # Assessment Engine & Adaptive Difficulty
│   ├── src/main/resources/
│   │   └── application.properties       # Spring Datasource, JWT, Port configs
│   ├── Dockerfile                       # Multi-stage Docker build for backend
│   └── pom.xml                          # Maven dependencies and build definition
├── src/                                 # React 19 Frontend Source
│   ├── components/                      # Reusable UI widgets, Radars, Streak Badges
│   ├── context/                         # AuthContext (JWT) & ThemeContext
│   ├── lib/                             # api.ts (Zero-Latency Guard), RAG, Elsa AI
│   └── pages/                           # Application Views (Dashboard, IDE, Reports, etc.)
├── public/                              # Static public web assets
├── Dockerfile                           # Root Dockerfile for cloud container platforms
├── render.yaml                          # Render 1-Click Blueprint (Web Service + Static Site)
├── vercel.json                          # Vercel SPA deployment configuration
├── package.json                         # Node dependencies & npm scripts
├── vite.config.ts                       # Vite build configuration
├── tailwind.config.js                   # Tailwind CSS design system tokens
├── server.cjs                           # Standalone Node.js mock/fallback API server
└── .env.example                         # Environment configuration template
```

---

## ⚙️ Prerequisites & Environment Setup

Ensure you have the following installed locally:
- **Java Development Kit (JDK) 21** or higher (`java -version`)
- **Apache Maven 3.9+** (or use bundled `./maven/apache-maven-3.9.6/bin/mvn`)
- **Node.js v18+** and **npm v10+** (`node -v`, `npm -v`)

### Setting up Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key variables configured in `.env`:
```ini
# Mistral AI API (Optional - offline demo fallback triggers if left empty)
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
MISTRAL_MODEL=open-mistral-7b

# Client-Side URL configuration
VITE_API_URL=http://localhost:8080
VITE_MISTRAL_API_KEY=your_mistral_api_key_here

# Backend Security
PORT=8080
JWT_SECRET=5f4dcc3b5aa765d61d8327deb882cf995f4dcc3b5aa765d61d8327deb882cf99
```

---

## 🚀 Local Quickstart

### 1. Running the Spring Boot Backend

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
*Note: If `mvn` is not globally on your PATH, use the bundled Maven runner:*
```bash
# Windows PowerShell:
..\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```
The backend starts at: **`http://localhost:8080`**
- **H2 Database Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/kodexisdb`
  - User: `sa` | Password: `password`
- **Health Check Ping**: `http://localhost:8080/api/auth/ping`

### 2. Running the React Frontend

Open a new terminal in the project root:
```bash
npm install
npm run dev
```
The client launches at: **`http://localhost:5173`**

### 3. Running the Standalone Mock Server (Alternative)
For testing frontend UI workflows without running the JVM:
```bash
npm run mock:server
```
Runs a lightweight Node.js simulation server on port `8080`.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/ping` | Health check endpoint returning `UP` status |
| `POST` | `/api/auth/register` | Register new candidate account |
| `POST` | `/api/auth/login` | Authenticate credentials and return JWT token |
| `POST` | `/api/auth/onboard` | Set target role, companies, and preferred language |
| `GET` | `/api/auth/me` | Retrieve active authenticated session profile |

### Interview & Execution Engine (`/api/interviews`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/interviews` | Create adaptive interview session |
| `GET` | `/api/interviews/{id}` | Fetch session metadata, question, and telemetry |
| `GET` | `/api/interviews/{id}/messages` | Retrieve conversation chat history |
| `POST` | `/api/interviews/{id}/message` | Send candidate query to AI Interviewer |
| `POST` | `/api/interviews/{id}/run` | Execute code on public test cases via Piston Sandbox |
| `POST` | `/api/interviews/{id}/submit` | Execute all test suites and run Multi-Factor Assessment |
| `GET` | `/api/interviews/{id}/assessment`| Fetch comprehensive autopsy scorecard and metrics |

### Progress & Telemetry (`/api/progress`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/progress/dashboard` | Candidate Technical DNA, weakness radar, and history |

### Learning Hub & Socratic RAG (`/api/learning`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/learning/knowledge/topics` | List computer science topic taxonomy |
| `POST` | `/api/learning/knowledge/query` | RAG semantic retrieval with document citations |
| `GET` | `/api/learning/assessment/diagnostic` | Adaptive BKT diagnostic test generation |
| `POST` | `/api/learning/assessment/submit` | Update BKT learner parameters and DAG mastery |
| `GET` | `/api/learning/course-map/graph` | Directed Acyclic Graph (DAG) topic dependencies |
| `GET` | `/api/learning/calendar/schedule` | Spaced repetition study schedule and events |

---

## 🌐 Deployment Guide

### Deploying to Render (Blueprint)
The repository includes a production [`render.yaml`](./render.yaml) blueprint:
1. Push your repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com/) -> **New +** -> **Blueprint**.
3. Select your repository. Render will automatically provision:
   - **`kodexis-backend`**: Docker Web Service running Spring Boot on port 8080.
   - **`kodexis-frontend`**: Static Site with automatic SPA rewrites pointing to `dist/`.

### Deploying to Vercel (Frontend)
1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Framework Preset: **Vite** | Root Directory: `./`.
3. Add Environment Variable:
   - `VITE_API_URL`: URL of your deployed backend (e.g., `https://kodexis-backend.onrender.com`).
4. Click **Deploy**. Vercel will build and distribute the app globally via Edge CDN.

### Docker Containerization
Build and run the unified backend container:
```bash
docker build -t kodexis-backend:latest -f Dockerfile .
docker run -p 8080:8080 -e PORT=8080 kodexis-backend:latest
```

---

## 🔑 Default Demo Credentials

The database auto-seeds the following accounts on initial startup:

| Account Type | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Candidate** | `vicky` | `password` | Pre-populated with historical mock interviews and Technical DNA |
| **Administrator** | `admin` | `admin123` | Access to `/admin` diagnostic cohort consoles |

---

## 🧪 Testing & Quality Verification

To verify code quality and builds:

```bash
# 1. Type-check and production bundle build
npm run build

# 2. Fast linting across frontend codebase
npm run lint

# 3. Backend compilation and tests
cd backend && mvn test-compile
```

---

## 📄 License
This project is licensed under the MIT License.
