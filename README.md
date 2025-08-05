# 🌐 NeoForum - Cyberpunk Community Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

> 🚀 A futuristic forum platform with cyberpunk aesthetics, built for the next generation of online communities.

## ✨ Features

### 🎨 **Cyberpunk Design**
- Animated grid backgrounds with neon gradients
- Glass morphism UI elements
- Purple/cyan color scheme with glowing effects
- Responsive design optimized for all devices

### 👥 **Community Management**
- Create and manage forums with custom subdomains
- Join/leave communities with member tracking
- Follow forums for personalized content feeds
- User profiles with post history and voting activity

### 📝 **Content & Interaction**
- Rich text post creation with markdown support
- Nested comment system with threading
- Upvote/downvote system for posts and comments
- Real-time vote counting and updates

### 🔐 **Authentication & Security**
- Secure user authentication via Supabase Auth
- Profile management with avatar uploads
- Role-based permissions (Admin, Moderator, User)
- Row-level security policies

### 🛠️ **Admin Tools**
- Comprehensive admin dashboard
- User and content moderation
- Forum management and statistics
- Reporting system for community safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/neoforum.git
   cd neoforum
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   bun install
   # or
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   \`\`\`

4. **Set up the database**
   
   Run the SQL scripts in order:
   \`\`\`bash
   # In your Supabase SQL editor, run these scripts:
   scripts/create-tables.sql
   scripts/create-functions.sql
   scripts/create-policies.sql
   scripts/seed-data.sql
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   bun dev
   # or
   npm run dev
   \`\`\`

6. **Visit the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

\`\`\`
neoforum/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication routes
│   ├── forum/             # Forum pages
│   ├── user/              # User profiles
│   └── actions/           # Server actions
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
├── scripts/              # Database scripts
└── public/               # Static assets
\`\`\`

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel
- **Package Manager**: Bun

## 🎯 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured forums |
| `/explore` | Discover new communities |
| `/forum/[subdomain]` | Individual forum pages |
| `/forum/[subdomain]/post/[id]` | Post detail with comments |
| `/user/[username]` | User profile pages |
| `/admin` | Admin dashboard |
| `/dashboard` | User dashboard |
| `/settings` | Account settings |

## 🔧 Database Schema

### Core Tables
- **profiles** - User profile information
- **forums** - Community forums
- **posts** - Forum posts
- **comments** - Post comments
- **post_votes** - Post voting system
- **comment_votes** - Comment voting system
- **forum_members** - Forum membership tracking

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the project**
   \`\`\`bash
   bun run build
   \`\`\`

2. **Start production server**
   \`\`\`bash
   bun start
   \`\`\`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:

- 📧 Open an issue on GitHub
- 💬 Join our community forum
- 📖 Check the documentation

---

<div align="center">
  <p>Made with ❤️ and ⚡ by the NeoForum team</p>
  <p>🌟 Star this repo if you found it helpful!</p>
</div>
