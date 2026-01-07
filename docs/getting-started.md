# Getting Started

Welcome to the Fundraising Event project! This guide will help you set up the development environment.

## Prerequisites

Ensure you have the following installed:
- **Node.js**: v20+ (using `pnpm`)
- **Docker**: For running Postgres and Redis services.
- **pnpm**: `npm install -g pnpm`

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/fundraising-event.git
    cd fundraising-event
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables**:
    - Copy `.env.example` to `.env` in `apps/api` and `apps/web`.
    - See [Configuration](configuration.md) for details on required variables.

## Running the App

1.  **Start Infrastructure** (Database & Redis):
    ```bash
    docker-compose up -d
    ```

2.  **Initialize Database**:
    ```bash
    pnpm prisma migrate dev
    ```

3.  **Start Development Servers**:
    ```bash
    pnpm dev
    ```
    This will start both the NestJS API (http://localhost:3000) and the React Frontend (http://localhost:5173).

## Useful Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts API and Web in development mode. |
| `pnpm build` | Builds all applications. |
| `pnpm lint` | Runs ESLint across the workspace. |
| `pnpm test` | Runs unit tests. |
