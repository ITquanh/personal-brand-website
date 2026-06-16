# Personal Brand Website

[**🇨🇳 中文版 (Chinese)**](./README_zh.md)

A modern, highly interactive, and fully dynamic personal brand website and portfolio built with Next.js. It features a sleek Bento Grid layout, an integrated Command Palette, and a comprehensive Admin Dashboard to manage your profile, timeline, projects, and skills dynamically.

## 🚀 Features

- **Modern Tech Stack**: Built with [Next.js 14](https://nextjs.org/) (App Router), TypeScript, and Tailwind CSS.
- **Dynamic Content Management**: Fully functional Admin Dashboard powered by **PostgreSQL** and **Prisma ORM**. No hardcoding required—update your profile, timeline, and projects directly from the web interface!
- **Interactive UI**:
  - 🎨 Sleek **Bento Grid** layout for the home page.
  - ⌨️ Integrated **Command Palette** (`Ctrl+K` or `Cmd+K`) for quick navigation.
  - 🌧️ Cool **Matrix Digital Rain** background effect on the About page.
- **Internationalization (i18n)**: Built-in support for English and Simplified Chinese.
- **Theme Support**: Seamless Dark/Light mode switching.
- **Responsive Design**: Looks great on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL (Neon/Supabase/Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ITquanh/personal-brand-website.git
cd personal-brand-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Database Connection (Your PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-for-nextauth"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 4. Database Setup

Push the Prisma schema to your database to create the necessary tables:

```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. To access the admin panel, navigate to `/admin`.

## ☁️ Deployment

This project is optimized for deployment on **Vercel**. 
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add your `DATABASE_URL` and `NEXTAUTH_SECRET` in the Vercel Environment Variables settings.
4. Deploy!

## 📄 License

This project is open-sourced under the MIT License.
