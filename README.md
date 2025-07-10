# StudyHelper - AI-Powered Study Assistant

StudyHelper is a Next.js web application that helps students and professionals study more efficiently by extracting text from PDFs and images, then generating AI-powered summaries and study questions.

## Features

- **File Upload**: Drag-and-drop or select PDF files and images (JPG, PNG)
- **Text Extraction**: 
  - Direct text extraction from PDF files
  - OCR (Optical Character Recognition) for images using Tesseract.js
- **AI-Powered Generation**:
  - Automated summary generation using OpenAI GPT
  - Study questions creation tailored to the content
- **Edit & Export**: 
  - Edit generated summaries and questions
  - Export results as text or PDF files
- **Clean UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Text Extraction**: 
  - PDF: `pdf-parse` library
  - OCR: `tesseract.js` library
- **AI**: OpenAI GPT API
- **UI Components**: Lucide React icons
- **File Upload**: React Dropzone

## Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- OpenAI API key (required for AI features)

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
   # Get your API key from: https://platform.openai.com/account/api-keys
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload a Document**: Drag and drop or select a PDF or image file (max 15MB)
2. **Text Extraction**: The app will automatically extract text from your document
3. **AI Generation**: AI will generate a summary and study questions based on the extracted text
4. **Edit & Export**: Review and edit the generated content, then export it as needed

## Project Structure

```
resumeAPP/
├── app/
│   ├── globals.css          # Global styles with Tailwind CSS
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main application page
│   └── api/
│       ├── extract-text/    # API route for text extraction
│       └── generate-ai-content/ # API route for AI generation
├── components/
│   ├── FileUpload.tsx       # File upload component with drag-and-drop
│   ├── TextExtraction.tsx   # Text extraction display component
│   └── AIGeneration.tsx     # AI content generation component
├── package.json             # Project dependencies
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## API Routes

### `/api/extract-text`
- **Method**: POST
- **Input**: FormData with file
- **Output**: JSON with extracted text
- **Supports**: PDF files and image files (JPG, PNG)

### `/api/generate-ai-content`
- **Method**: POST
- **Input**: JSON with text content
- **Output**: JSON with summary and questions array
- **Requires**: OpenAI API key

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |

## Development

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run linter**: `npm run lint`

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

3. **Set environment variables** in your deployment platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] User authentication and accounts
- [ ] Save results to database
- [ ] Support for more file formats
- [ ] Batch processing
- [ ] Export to various formats
- [ ] Mobile app version 