# Econest - Carbon Footprint Tracker

A clean, responsive web application for tracking and comparing regional carbon footprints with water consumption monitoring.

## Features

- 🌍 **Regional Comparisons** - Compare your consumption with others in your region
- 💧 **Water Consumption Tracking** - Monitor monthly and annual water usage
- 📊 **Interactive Charts** - Visualize your data over time
- 🤖 **AI Insights** - Get personalized recommendations (with OpenAI API)
- 🌡️ **Weather Impact** - See how weather affects your consumption
- 📱 **Mobile Optimized** - Fully responsive design
- 🎨 **Theme Support** - Light, dark, ocean, and spooky themes
- 🌐 **Multi-language** - English and Russian support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI
- **Charts**: Chart.js + Recharts
- **AI**: OpenAI GPT integration

## Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd econest
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
DATABASE_URL=postgresql://your_database_url
SESSION_SECRET=your_32_character_secret_key
OPENAI_API_KEY=sk-your_openai_key  # Optional
```

4. **Initialize database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

## Deployment

See [DEPLOYMENT_REQUIREMENTS.md](./DEPLOYMENT_REQUIREMENTS.md) for detailed deployment instructions on Render, Railway, and other platforms.

### Quick Deploy on Render

1. Connect your GitHub repository
2. Build Command: `npm ci && npm run build`
3. Start Command: `npm start`
4. Add environment variables (DATABASE_URL, SESSION_SECRET)
5. Deploy!

## License

MIT License - feel free to use for personal or commercial projects.