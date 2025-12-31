# Translato - Document Translator

A full-stack web application that translates Microsoft Word (.docx) and PowerPoint (.pptx) documents while preserving their original formatting and structure.

## Features

- 📄 **Format Preservation**: Translates text while keeping all formatting, fonts, colors, and layout intact
- 🌍 **Multiple Languages**: Supports translation to Spanish, French, German, Dutch, and Italian
- ⚡ **Fast Processing**: Powered by Claude 3.5 Haiku for quick, accurate translations
- 🎨 **Modern UI**: Clean, responsive interface with smooth animations
- 📊 **Real-time Status**: Live updates during translation process

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- Custom hooks for state management
- CSS with custom properties (theming)

### Backend
- **FastAPI** (Python)
- **python-docx** and **python-pptx** for document processing
- **Anthropic Claude API** for translation
- Async API pattern with job-based processing

## Architecture

The application follows clean architecture principles:

- **Backend**: Routes → Services → Handlers (Strategy Pattern)
- **Frontend**: Components → Hooks → API layer
- Separation of concerns with framework-agnostic business logic

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Anthropic API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults work for local dev):
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173` (or next available port)

## Usage

1. Open the application in your browser
2. Upload a `.docx` or `.pptx` file (max 10MB)
3. Select target language
4. Click "Upload & Translate"
5. Wait for translation to complete
6. Download your translated document

## Project Structure

```
document-translator/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # HTTP endpoints
│   │   ├── services/          # Business logic
│   │   ├── handlers/          # File-specific processors
│   │   ├── models/            # Pydantic schemas
│   │   └── core/              # Configuration
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── hooks/             # Custom React hooks
│   │   ├── config/            # App configuration
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Main component
│   │   └── App.css            # Styles
│   ├── .env.example
│   └── package.json
└── README.md
```

## Configuration

### Backend (`backend/.env`)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)

### Frontend (`frontend/.env`)
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
- `VITE_DEBUG` - Enable debug mode (default: `false`)

## Supported File Types

- **Word Documents**: `.docx` (Microsoft Word 2007+)
- **PowerPoint Presentations**: `.pptx` (Microsoft PowerPoint 2007+)

Maximum file size: 10MB

## Translation Languages

- Spanish (es)
- French (fr)
- German (de)
- Dutch (nl)
- Italian (it)

## How It Works

1. **Upload**: File is uploaded to backend and saved temporarily
2. **Processing**: Document structure is parsed using python-docx/python-pptx
3. **Translation**: Text content is sent to Claude API for translation
4. **Reconstruction**: Translated text is inserted back into document structure
5. **Download**: Modified document is returned with formatting preserved

## Development

This project was built as a learning exercise to practice:
- Full-stack web development
- Clean architecture patterns
- React state management
- FastAPI async patterns
- LLM API integration
- Document processing

## License

This is a personal learning project. Feel free to use it as a reference for your own projects.

## Acknowledgments

- Translation powered by [Anthropic's Claude API](https://www.anthropic.com/)
- Document processing using [python-docx](https://python-docx.readthedocs.io/) and [python-pptx](https://python-pptx.readthedocs.io/)
