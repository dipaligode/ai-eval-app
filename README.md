Got it! You want a clean README that matches your project but **doesn’t include the `users` table** (because Supabase Auth is handling that) and reflects your actual structure. Here’s what you should include:

````markdown
# AI Agent Evaluation Framework

A multi-tenant Next.js app to manage and analyze AI agent evaluations. Built with **Next.js**, **React**, and **Supabase**.

---

## 🚀 Project Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-eval-app.git
cd ai-eval-app
````

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**
   Create a `.env.local` file in the root directory with the following:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

5. **Seed database with sample data**

```bash
npm run seed
```

---

## 📂 Database Schema

**evals**

* `id` (UUID, primary key)
* `user_id` (UUID, foreign key → Supabase Auth user)
* `interaction_id` (text)
* `prompt` (text)
* `response` (text)
* `score` (float)
* `latency_ms` (integer)
* `flags` (array of integers, references `flags.id`)
* `pii_tokens_redacted` (integer)
* `created_at` (timestamp)

**flags**

* `id` (integer, primary key)
* `name` (text)
* `description` (text)

**eval_settings**

* `id` (UUID, primary key)
* `user_id` (UUID, foreign key → Supabase Auth user)
* `run_policy` (text: 'always' / 'sampled')
* `sample_rate_pct` (integer)
* `obfuscate_pii` (boolean)
* `max_eval_per_day` (integer)


## 🔒 RLS Notes (Row-Level Security)

* **evals table:** Users can only `SELECT`, `INSERT`, `DELETE` their own evaluations
* **eval_settings table:** Users can only read/write their own settings
* Policies ensure multi-tenancy and prevent cross-user data access

---

## 🧪 Seed Script

Run the seed script to generate sample evaluation data, including:

* Default flags (`safe`, `offensive`, `slow`, `low_quality`, `irrelevant`, `incomplete`, `format_error`, `plagiarized`, `contains_sensitive`)
* Synthetic evaluations with varied prompts, responses, scores, latencies, and flags

```bash
npm run seed
```

```




This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
