# StudyHelper - AI-Powered Document Processing

Transform documents into study materials with advanced AI technology. StudyHelper automatically generates summaries and study questions from your PDFs and images.

you can access it on https://studyhelper.app/

![StudyHelper](https://img.shields.io/badge/StudyHelper-AI%20Powered-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC)

## ✨ Features

### 📄 **Document Processing**
- **PDF Support**: Upload and process PDF documents
- **Image OCR**: Extract text from images (JPG, PNG, GIF, WebP)
- **Multiple Formats**: Support for various file types
- **File Size Limit**: Up to 4.5MB per file

### 🤖 **AI-Powered Analysis**
- **Smart Summaries**: Generate comprehensive document summaries
- **Study Questions**: Create relevant study questions automatically
- **Multi-language Support**: Portuguese and English
- **High Accuracy**: Powered by OpenAI's advanced language models

### 👤 **User Management**
- **Secure Authentication**: Clerk-powered user authentication
- **Free Trial**: 1 free use for anonymous users
- **Registered Users**: 3 free uses per month
- **Premium Plans**: Unlimited usage with subscription

### 💾 **Document Management**
- **Save Documents**: Store processed documents securely
- **History**: Access your document history
- **Export Options**: Download as TXT or PDF
- **Cloud Storage**: Supabase-powered secure storage

### 💳 **Subscription System**
- **Multiple Plans**: Free, Individual, Starter, Pro, Unlimited
- **Stripe Integration**: Secure payment processing
- **Usage Tracking**: Monitor your usage and credits
- **Customer Portal**: Manage subscriptions easily

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud Vision API key
- OpenAI API key
- Supabase account
- Clerk account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studyhelper.git
   cd studyhelper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret

   # Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

   # AI Services
   OPENAI_API_KEY=your_openai_key
   GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key

   # Payments
   STRIPE_SECRET_KEY=your_stripe_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Database and authentication
- **Clerk**: User authentication and management
- **OpenAI API**: AI-powered text generation
- **Google Cloud Vision API**: OCR for images

### Payments & Infrastructure
- **Stripe**: Payment processing and subscriptions
- **Vercel**: Deployment and hosting
- **PostgreSQL**: Database (via Supabase)

## 📱 Usage

### For Anonymous Users
1. Upload a PDF or image
2. Get one free AI-generated summary and questions
3. Export results as TXT or PDF
4. Create an account for more features

### For Registered Users
1. Sign up for a free account
2. Get 3 free uses per month
3. Save documents to your history
4. Upgrade to premium for unlimited usage

### Document Processing
1. **Upload**: Drag and drop or click to upload
2. **Process**: AI analyzes your document
3. **Review**: Edit generated summary and questions
4. **Save**: Store for future reference
5. **Export**: Download in your preferred format

## 🔧 API Endpoints

### Document Processing
- `POST /api/extract-text` - Extract text from PDFs
- `POST /api/extract-text-ocr` - OCR processing for images
- `POST /api/generate-ai-content` - Generate summaries and questions

### User Management
- `GET /api/user-usage` - Get user usage statistics
- `POST /api/update-usage-after-payment` - Update usage after payment

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/create-subscription` - Create subscription
- `POST /api/cancel-subscription` - Cancel subscription
- `POST /api/create-customer-portal` - Access customer portal


## 🔒 Security Features

- **Secure Authentication**: Clerk-powered user management
- **API Key Protection**: Environment variable security
- **Database Security**: Supabase Row Level Security
- **Payment Security**: Stripe PCI compliance
- **File Validation**: Upload size and type restrictions

## 🌍 Internationalization

- **Portuguese (pt)**: Primary language
- **English (en)**: Secondary language
- **Dynamic Language Switching**: Real-time language changes



**Made with ❤️ for students and educators worldwide** 