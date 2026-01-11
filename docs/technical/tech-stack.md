# Technology Stack

This document lists the core technologies and libraries used in usage across the Fundraising Event platform, along with links to their official documentation.

## Core Stack

| Component        | Technology      | Version | Documentation                                       |
| :--------------- | :-------------- | :------ | :-------------------------------------------------- |
| **Monorepo**     | pnpm Workspaces | -       | [pnpm Docs](https://pnpm.io/workspaces)             |
| **Backend**      | NestJS          | 10.x    | [NestJS Docs](https://docs.nestjs.com/)             |
| **Frontend**     | React           | 19.x    | [React Docs](https://react.dev/)                    |
| **Build Tool**   | Vite            | 5.x     | [Vite Docs](https://vitejs.dev/)                    |
| **Database**     | PostgreSQL      | 15+     | [PostgreSQL Docs](https://www.postgresql.org/docs/) |
| **ORM**          | Prisma          | 5.x     | [Prisma Docs](https://www.prisma.io/docs)           |
| **Cache/PubSub** | Redis           | 7.x     | [Redis Docs](https://redis.io/docs/)                |

---

## Backend Libraries (`apps/api`)

| Library       | Purpose                             | Documentation                                                |
| :------------ | :---------------------------------- | :----------------------------------------------------------- |
| **BulllMQ**   | Background job queues (Redis based) | [BullMQ Docs](https://docs.bullmq.io/)                       |
| **Passport**  | Authentication strategies           | [Passport Docs](https://www.passportjs.org/)                 |
| **Socket.IO** | Real-time WebSocket communication   | [Socket.IO Docs](https://socket.io/docs/v4/)                 |
| **pdfmake**   | PDF generation (Server-side)        | [pdfmake Docs](http://pdfmake.org/#/)                        |
| **nodemaler** | Email sending                       | [Nodemailer Docs](https://nodemailer.com/about/)             |
| **Stripe**    | Payment processing SDK              | [Stripe Node SDK](https://github.com/stripe/stripe-node)     |
| **PayPal**    | PayPal REST SDK                     | [PayPal Rest SDK](https://github.com/paypal/PayPal-node-SDK) |

---

## Frontend Libraries (`apps/web`)

| Library             | Purpose                              | Documentation                                                    |
| :------------------ | :----------------------------------- | :--------------------------------------------------------------- |
| **Shadcn/UI**       | Reusable UI components               | [shadcn/ui](https://ui.shadcn.com/)                              |
| **Tailwind CSS**    | Utility-first CSS framework          | [Tailwind CSS](https://tailwindcss.com/)                         |
| **TanStack Query**  | Async state management (React Query) | [TanStack Query](https://tanstack.com/query/latest)              |
| **React Hook Form** | Form state management                | [React Hook Form](https://react-hook-form.com/)                  |
| **Zod**             | Schema validation                    | [Zod Docs](https://zod.dev/)                                     |
| **i18next**         | Internationalization                 | [react-i18next](https://react.i18next.com/)                      |
| **Recharts**        | Data visualization (Charts)          | [Recharts Docs](https://recharts.org/)                           |
| **QR Code Styling** | QR Code generation                   | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) |

---

## Testing & Quality

| Library        | Purpose                        | Documentation                              |
| :------------- | :----------------------------- | :----------------------------------------- |
| **Vitest**     | Unit & Integration Test Runner | [Vitest Docs](https://vitest.dev/)         |
| **Playwright** | End-to-End Testing             | [Playwright Docs](https://playwright.dev/) |
| **ESLint**     | Code linting                   | [ESLint Docs](https://eslint.org/)         |
| **Prettier**   | Code formatting                | [Prettier Docs](https://prettier.io/)      |
