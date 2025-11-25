This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

# 🇲🇾 MyPeta - Malaysian Data Visualization & News Platform
# 🇲🇾 MyPeta - Malaysian Data Visualization & News Platform
# 🇲🇾 MyPeta - Malaysian Data Visualization & News Platform

A modern, full-stack web application featuring interactive data visualizations, community polls, and real-time news aggregation for Malaysia.

## ✨ Features

### 📊 Data Visualization
- Interactive Malaysia map with state-level data
- Multiple data categories (income, population, crime, water consumption, expenditure)
- Beautiful charts powered by Recharts
- State selector with search functionality
- Responsive design for all devices

### 🗳️ Polls System
- Create and vote on community polls
- Real-time results with state breakdown
- Gamification system (points, XP, levels)
- User authentication with Clerk
- Poll translation support (EN/MS)
- Visual poll results with charts

### 📰 News Aggregation (NEW!)
- Real-time RSS/XML feed parsing
- 8+ news sources (Malaysian & International)
  - **Malaysian**: The Star, Bernama, Malaysiakini, NST, Malay Mail
  - **International**: BBC, Reuters, Al Jazeera
- Featured breaking news section
- Source filtering
- Beautiful card-based layout
- Refresh on demand
- See [NEWS_FEATURE.md](./NEWS_FEATURE.md) for detailed documentation

### 🌐 Internationalization
- Full bilingual support (English/Bahasa Malaysia)
- Google Translate API integration
- Language toggle in UI
- Automatic content translation

### 🎨 Theme System
- Dark mode / Light mode toggle
- Smooth transitions
- System preference detection
- Persistent user preference

### 📱 Mobile Optimized
- Responsive design
- Mobile bottom navigation
- Touch-friendly interactions
- PWA-ready architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mypeta.git
cd mypeta
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Google Translate (Optional)
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
mypeta/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── NewsCard.tsx    # News article card
│   ├── FeaturedNews.tsx # Featured news hero
│   └── ...
├── contexts/           # React context providers
│   ├── DataContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   │   └── news/      # News API endpoints
│   ├── index.tsx      # Home (data viz)
│   ├── polls/         # Polls page
│   └── news/          # News page
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── data/               # Static data
├── public/             # Static assets
└── styles/             # Global styles
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **RSS Parsing**: xml2js

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Analytics**: (Ready to integrate)

## 🎯 Key Pages

- `/` - Home page with data visualization
- `/polls` - Community polls
- `/news` - News aggregation
- `/profile` - User profile & stats
- `/privacy` - Privacy policy
- `/terms` - Terms of service

## 🔌 API Endpoints

### News API
```
GET /api/news/fetch?sources=thestar,bbc,reuters
```
Returns aggregated news from selected sources. See [NEWS_FEATURE.md](./NEWS_FEATURE.md) for details.

### Polls API
- Auth endpoints for user management
- Vote submission and retrieval
- Stats calculation

## 📚 Learn More

- [NEWS_FEATURE.md](./NEWS_FEATURE.md) - News feature documentation
- [TRANSLATION_GUIDE.md](./TRANSLATION_GUIDE.md) - Translation system guide

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Learn Next.js](https://nextjs.org/learn-pages-router) - Interactive Next.js tutorial
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Data sources from Malaysian government open data
- News sources: The Star, Bernama, BBC, Reuters, Al Jazeera, and more
- UI components from shadcn/ui
- Icons from Lucide React
- Maps and visualizations built with love for Malaysia

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for Malaysia**


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions are welcome!

