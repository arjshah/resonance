# Resonance

A powerful customer reviews and insights platform that helps businesses manage and analyze their online presence across multiple platforms.

## 🌟 Features

- **Review Management**
  - Sync reviews from Yelp and Google Business Profile
  - Centralized dashboard for all reviews
  - Real-time review notifications

- **AI-Powered Insights**
  - Sentiment analysis
  - Topic extraction
  - Automated review summaries
  - Trend identification

- **Business Tools**
  - Customer engagement tracking
  - Response templates
  - Performance analytics
  - Team collaboration features

- **Integration Support**
  - Yelp Business API
  - Google Business Profile API
  - OpenAI GPT-4 for analysis
  - Twilio for notifications

## 🚀 Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - shadcn/ui Components

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL (via Supabase)

- **Authentication**
  - NextAuth.js
  - Google OAuth

- **APIs & Services**
  - OpenAI API
  - Yelp Fusion API
  - Google Places API
  - Twilio API
  - Stripe (for payments)

## 💻 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/arjshah/resonance.git
   cd resonance
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in `.env` (See Environment Variables Setup section below)

4. **Database Setup**
   ```bash
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser

## 🔑 Environment Variables Setup

The following services need to be configured:

1. **Database**: PostgreSQL database URL
2. **Authentication**: NextAuth.js configuration
3. **Google Services**:
   - OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Places API key for business location services
4. **Supabase**: Database and authentication services
5. **Stripe**: Payment processing (optional)
6. **Twilio**: SMS notifications
7. **OpenAI**: AI-powered review analysis
8. **Yelp**: Business information and reviews sync

See `.env.example` for all required environment variables.

### Setting up API Keys:

1. **Google Cloud Platform**:
   - Create a project in Google Cloud Console
   - Enable OAuth 2.0 and Places API
   - Create credentials and add authorized redirect URIs

2. **Yelp Fusion API**:
   - Create an app at [Yelp Fusion](https://fusion.yelp.com)
   - Get API key and Client ID

3. **OpenAI**:
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Create an API key with access to GPT-4

4. **Twilio**:
   - Create account at [Twilio](https://www.twilio.com)
   - Get Account SID, Auth Token, and phone number

5. **Supabase**:
   - Create a project at [Supabase](https://supabase.com)
   - Get project URL and anon key

6. **Stripe** (optional):
   - Sign up for [Stripe](https://stripe.com)
   - Get publishable and secret keys

## 📦 Project Structure
resonance/
├── src/
│ ├── app/ # Next.js app router pages
│ ├── components/ # React components
│ ├── lib/ # Utility functions and configurations
│ └── types/ # TypeScript type definitions
├── prisma/ # Database schema and migrations
├── public/ # Static assets
└── scripts/ # Utility scripts

## 🔒 Security

- All API keys and secrets are stored in environment variables
- Authentication is handled securely through NextAuth.js
- Data encryption for sensitive information
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- **Arjun Shah** - *Initial work* - [arjshah](https://github.com/arjshah)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Resonance
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

