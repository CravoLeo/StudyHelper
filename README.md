# StudyHelper - AI-Powered Study Assistant

StudyHelper is a Next.js web application that helps students and professionals study more efficiently by extracting text from PDFs and images, then generating AI-powered summaries and study questions.

## Features

- **File Upload**: Drag-and-drop or select PDF files and images (JPG, PNG)
- **Text Extraction**: 
  - Direct text extraction from PDF files ✅ **Working perfectly**
  - OCR (Optical Character Recognition) for images using Tesseract.js ⚠️ **Optimized for serverless**
- **AI-Powered Generation**:
  - Automated summary generation using OpenAI GPT ✅ **Working perfectly**
  - Study questions creation tailored to the content ✅ **Working perfectly**
- **Edit & Export**: 
  - Edit generated summaries and questions
  - Export results as text or PDF files
- **Clean UI**: Modern, responsive design with Tailwind CSS
- **User Authentication**: Secure login with Clerk
- **Usage Tracking**: Credit-based system with Stripe integration

## 📋 **Image Processing Notes**

**For best results with images:**
- Use **high-contrast, clear text** (black text on white background)
- **Avoid handwritten text** - OCR works best with printed text
- **Keep images under 5MB** for faster processing
- **Consider converting to PDF** for complex documents

**If image OCR fails:**
- Try **converting your image to PDF** first (many online tools available)
- Use **higher resolution images** (at least 300 DPI)
- Ensure **good lighting** and **minimal skew** in photos

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Authentication**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **Text Extraction**: 
  - PDF: `pdf-parse` library
  - OCR: `tesseract.js` library (optimized for serverless)
- **AI**: OpenAI GPT API
- **UI Components**: Lucide React icons
- **File Upload**: React Dropzone

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- OpenAI API key (required for AI features)
- Clerk account for authentication
- Supabase account for database
- Stripe account for payments (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resumeAPP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   # OpenAI API Key for AI-powered summary and question generation
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Stripe Payments (Optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Sign up/Login**: Create an account or sign in
2. **Upload a Document**: Drag and drop or select a PDF or image file (max 15MB)
3. **Text Extraction**: The app will automatically extract text from your document
4. **AI Generation**: AI will generate a summary and study questions based on the extracted text
5. **Edit & Export**: Review and edit the generated content, then export it as needed
6. **Save Documents**: Documents are saved to your account for future reference

or

accessing https://studyhelper.app/

## Roadmap

- [ ] Enhanced OCR with multiple engines
- [ ] Batch processing for multiple files
- [ ] Advanced export formats (Word, PowerPoint)
- [ ] Team collaboration features
- [ ] Mobile app version 
