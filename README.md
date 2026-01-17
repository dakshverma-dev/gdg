# CareSRE - Smart OPD Queue Management System

An AI-powered OPD (Outpatient Department) queue management system designed for government hospitals. CareSRE streamlines patient registration, automated triage, and real-time queue management to reduce wait times and improve healthcare delivery.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5-4285F4?style=flat-square&logo=google)

## ✨ Features

### Patient Portal
- **Smart Registration** - Enhanced form with medical history capture
- **Document Upload** - AI-powered analysis of medical documents using Gemini Vision
- **OPD Slip Generation** - Compact slip with QR code for quick verification
- **Real-time Queue Status** - Track position in queue

### Doctor Portal
- **Queue Management** - View and manage patient queue
- **Patient Actions** - Mark patients as in-consultation, completed, or referred
- **Priority Indicators** - Visual priority flags based on AI triage

### Admin Dashboard
- **Live Statistics** - Real-time patient counts and queue metrics
- **Alert System** - Clinical alerts for critical cases
- **Queue Analytics** - Monitor wait times and throughput

### AI Agents (6 Total)
- **Patient Intake Agent** - Validates and processes registration
- **Triage Agent** - AI-powered priority assessment with keyword fallback
- **Document Analysis Agent** - Extracts info from uploaded medical documents
- **Queue Prediction Agent** - Estimates wait times
- **Clinical Alert Agent** - Flags urgent cases
- **Admin Workflow Agent** - Optimizes queue flow

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dakshverma-dev/gdg.git
cd gdg

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.jsx          # Landing page
│   ├── patient/          # Patient registration portal
│   ├── doctor/           # Doctor queue management
│   ├── admin/            # Admin dashboard
│   ├── slip/             # OPD slip viewer
│   └── api/              # API routes
│       ├── register/     # Patient registration
│       ├── patients/     # Patient data CRUD
│       └── doctor/       # Doctor actions
├── components/           # Reusable UI components
└── lib/
    ├── agents/           # AI agent implementations
    ├── store.ts          # In-memory data store
    └── utils.ts          # Utility functions
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.1 |
| UI | React 19 |
| Styling | Vanilla CSS (custom design system) |
| AI | Google Gemini 1.5 Flash |
| QR Code | qrcode.react |
| State | In-memory store |

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔮 Roadmap

See [TODO.txt](./TODO.txt) for detailed task list.

### High Priority
- [ ] Firebase integration for data persistence
- [ ] Authentication (doctor/admin/reception roles)
- [ ] Fresh Gemini API key configuration

### Medium Priority
- [ ] SMS/WhatsApp notifications
- [ ] Real-time WebSocket updates
- [ ] Patient history lookup
- [ ] Reports & analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for the GDG Hackathon.

## 👥 Team

Built with ❤️ for improving healthcare accessibility in government hospitals.

---

**Repository**: [github.com/dakshverma-dev/gdg](https://github.com/dakshverma-dev/gdg)
