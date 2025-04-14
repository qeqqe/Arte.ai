# Arte.ai - Backend API

This package contains the backend services for the Arte.ai application, built with [NestJS](https://nestjs.com/) and TypeScript. It follows a microservice architecture to handle different aspects of the application logic.

## Architecture Overview

The backend is composed of several microservices located under the `/apps` directory, communicating asynchronously via RabbitMQ. Shared functionalities and data structures are organized within the `/libs` directory.

### Microservices (`/apps`)

1.  **Auth Service (`/apps/auth`)**

    - **Responsibility:** Handles all user authentication and authorization.
    - **Features:**
      - GitHub OAuth 2.0 for initial login/signup.
      - JWT-based session management using access and refresh tokens.
      - Implements authentication strategies and guards.

2.  **Ingestion Service (`/apps/ingestion`)**

    - **Responsibility:** Gathers and processes data from various user sources and job postings.
    - **Features:**
      - Fetches user data from GitHub (profile info, pinned repositories).
      - Fetches user data from LeetCode (problem-solving stats).
      - Handles resume uploads (PDF parsing via a Python service).
      - Scrapes and processes job descriptions from LinkedIn URLs (via an external scraper/internal logic).
      - Stores ingested data in the database.
      - Publishes events (e.g., `job_scraped`) to RabbitMQ for further processing.

3.  **Analysis Service (`/apps/analysis`)**
    - **Responsibility:** Performs analysis based on user data and job requirements using NLP.
    - **Features:**
      - Listens for events from RabbitMQ (e.g., to process scraped job data).
      - Uses OpenAI (or other NLP services) to extract skills from job descriptions and user profiles (resume, GitHub READMEs).
      - Provides endpoints to compare a user's processed skills against a job's required skills.
      - Generates skill gap analysis reports.
      - Calculates user statistics and proficiency levels.

### Shared Libraries (`/libs`)

1.  **Common Library (`/libs/common`)**

    - Contains shared modules, services, and configurations used across multiple microservices.
    - Examples: Drizzle ORM setup, database schemas, RabbitMQ service (`RmqModule`, `RmqService`), authentication guards (`JwtAuthGuard`), logging (`LoggerModule`), base DTOs, utility functions.

2.  **DTOs Library (`/libs/dtos`)**
    - Defines Data Transfer Objects used for request/response validation and type safety, particularly for inter-service communication or API contracts.

## Technologies Used

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** GitHub OAuth, JWT (Access & Refresh Tokens)
- **Message Broker:** RabbitMQ
- **API Specification:** Swagger (via `@nestjs/swagger`)
- **NLP:** OpenAI (GPT models)

## Setup & Running

This API package is part of the main Arte.ai monorepo setup.

1.  **Prerequisites:** Ensure you have Node.js, pnpm, Docker, and Docker Compose installed.
2.  **Environment Variables:** Each microservice (`auth`, `ingestion`, `analysis`) has its own `.env.example` file within its respective `apps/<service-name>` directory. Copy these to `.env` files and populate them with the necessary credentials and configuration (Database URL, JWT secrets, API keys, RabbitMQ URI, etc.). You might also need a root `.env` file in the `packages/api` directory depending on shared configurations.
3.  **Install Dependencies:** From the root of the _monorepo_ (`/home/qeqqer/codebase/Skill-Gap-Analyzer/`), run:
    ```bash
    pnpm --filter api i
    ```
4.  **Database Migrations:** Generate and apply database migrations using Drizzle Kit (from within the `packages/api` directory):

    ```bash
    # Generate migration files based on schema changes
    pnpm db:generate

    # Apply migrations (ensure your database service is running)
    # You might need a separate script or command to apply migrations,
    # often run before starting the application services.
    # Example: node apply-migrations.js or integrate into startup
    ```

5.  **Run Services:** Use Docker Compose from the _monorepo root_ to build and start all services (including the database, RabbitMQ, and the NestJS microservices):
    ```bash
    docker compose up --build
    ```
    - The `--build` flag is only needed the first time or when code/dependencies change.
    - Services will typically run in watch mode for development.

## Contributing

Contributions to the backend are highly welcome!

1.  **Fork & Clone:** Fork the main `Arte.ai` repository and clone your fork.
2.  **Branch:** Create a new branch for your feature or bug fix (`git checkout -b feature/my-new-feature` or `fix/issue-123`).
3.  **Develop:** Make your changes within the `packages/api` directory, adhering to the existing code style and architecture. Add tests where appropriate.
4.  **Test:** Ensure existing tests pass and add new ones for your changes.

    ```bash
    # Run unit/integration tests (from packages/api)
    pnpm test

    # Run e2e tests (from packages/api)
    pnpm test:e2e
    ```

5.  **Lint & Format:** Ensure code quality.
    ```bash
    # From packages/api
    pnpm lint
    pnpm format
    ```
6.  **Commit:** Commit your changes with clear messages.
7.  **Push:** Push your branch to your fork.
8.  **Pull Request:** Open a Pull Request against the main `Arte.ai` repository's `main` or `develop` branch. Describe your changes clearly.
