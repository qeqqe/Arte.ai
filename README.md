# Skill Gap Analyzer

Skill Gap Analyzer is a SaaS solution helping professionals by comparing their existing skill set with market needs. The platform takes data from various sources such as user's LinkedIn, GitHub, LeetCode, and resumes, extracts and normalizes skills with the help of NLP, and matches them with job requirements to create personalized, actionable suggestions.

## Key Features

- **Multi-Source Data Ingestion:**
  - Scrape user data from LinkedIn, GitHub, and LeetCode.
  - Parse resumes (PDF, DOCX) to pull relevant information.
- **Skill Extraction & Normalization:**
  - **Plan A:** Using external NLP APIs (Gemini or OpenAI) for direct extraction.
  - **Plan B:** Using a custom Python microservice (with FastAPI and HuggingFace Transformers) for fine-grained, in-house processing.
- **Skill Gap Analysis:**
  - Match user skills against job posting requirements.
- Provide a readiness score and suggest targeted learning.
- **Authentication & Security:**
  - Secure sign-in and sign-up through GitHub OAuth.
  - JWT authentication with refresh token handling.
- **Microservices Architecture:**
  - Developed as a NestJS monorepo with dedicated microservices for Auth, Ingestion, Analysis, Job Processing, etc.
  - Shared libraries for utilities common to all (e.g., Pino logger, DTOs, configuration).
- **Containerization & Deployment:**
  - Everything is containerized and orchestrated using Docker Compose for standardized deployment.

## Architecture Overview

The project is organized into separate microservices:

- **Auth Service:**
  Manages GitHub OAuth login, handles callbacks, and provides JWT tokens.
- **Ingestion Service:**
  Processes scraping (through Crawl4AI) and resume parsing.
- **Analysis Service:**
  Summarizes user data, invokes NLP modules, and does skill gap calculation.
- **Job Service:**
  Scrapes job posts and extracts job requisites.
- **Python Microservice (Plan B):**
  Offers bespoke NLP-driven skill extraction through HuggingFace Transformers.

## Getting Started

### Prerequisites

- Node.js
- Docker & Docker Compose

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/qeqqe/skill-gap-analyzer.git
   cd skill-gap-analyzer
   ```

2. **Run the docker container:**
   ```bash
   docker-compose up
   ```
3. **Access the Application:**
   navigate to `http://localhost:5173`.
