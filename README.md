# 📚 Study Buddy AI — Intelligent Learning & Note Assistant

> **ACT AI Final Capstone Project**
> A modern, AI-powered study companion designed to summarize notes, answer student queries, and streamline learning workflows.

[

![Live App](https://img.shields.io/badge/Live-Demo-brightgreen)

](https://study-buddy-ai-5374.lovable.app)
[

![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable%20AI-blueviolet)

](https://lovable.dev)
[

![TypeScript](https://img.shields.io/badge/TypeScript-96.3%25-blue)

](#)

---

## 🔗 Project Links

- 🌐 **Live Deployed App:** [study-buddy-ai-5374.lovable.app](https://study-buddy-ai-5374.lovable.app)
- 💻 **GitHub Repository:** [github.com/suhailahmedaamro786/study-buddy-ai-5374](https://github.com/suhailahmedaamro786/study-buddy-ai-5374)

---

## 🧩 Abstract & Problem Statement

Students and self-learners often struggle with information overload, managing lengthy lecture notes, and getting quick, accurate answers to specific study questions. Traditional note-taking apps lack intelligent features that assist in active retention and quick comprehension.

**Study Buddy AI** solves this problem by providing a centralized digital library equipped with an autonomous AI assistant that helps students summarize, organize, and interact with their study materials seamlessly.

---

## ✨ Key Features

- 📝 **Smart Note Management** — Create, save, and manage study notes directly in your browser, synced to a personal library.
- 📤 **Upload Anything** — Paste text, upload PDFs, screenshots, or handwritten photos; the AI reads and processes them automatically.
- 🤖 **AI-Powered Assistance** — Generates concise summaries (distilled to essentials), highlights key concepts, and creates flashcards and quiz questions from your notes.
- 🔍 **Personal Library** — Every study set is saved and searchable across devices.
- ⚡ **Fast & Responsive UI** — Clean, intuitive interface optimized for effortless study sessions.
- 🔐 **Secure Authentication** — User accounts and data protected via Supabase Auth.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend / Database | Supabase |
| AI Integration | Lovable AI |
| Package Manager | Bun |
| Deployment | Lovable Cloud |

---

## 🤖 AI Feature Details

The AI study assistant analyzes pasted text or uploaded PDFs and images (via OCR) and automatically produces a structured study set:

- **Smart Summary** — A ~100-word summary capturing the three most important points.
- **Key Concept Flashcards** — Five question-and-answer flashcards for active recall.
- **Quiz Questions** — Three multiple-choice questions with one marked correct answer.
- **Motivational Tip** — A short encouraging tip to keep the learner motivated.

### Model

Study material generation and document/image text extraction both use:

- `google/gemini-2.5-flash` via the Lovable AI Gateway.

### System Prompt

The exact system prompt sent to the model is:

```text
You are a patient and encouraging study assistant. Your task is to help students understand complex topics simply. When given notes or text:

1. Create a 100-word summary that captures the 3 most important points
2. Generate 5 flashcards (each with a question and answer) that test understanding
3. Create 3 quiz questions (multiple choice) with the correct answer marked with an asterisk (*)
4. End with one short motivational tip

Rules:
- Keep explanations simple — like you're explaining to a friend
- Never give direct answers to homework, but always guide understanding
- Use clear formatting with headings for each section
- Keep the tone warm and encouraging

Respond ONLY with valid JSON matching this exact shape (no markdown code fences):
{
  "title": "string (short 3-6 word topic label)",
  "summary": "string (~100 words)",
  "flashcards": [{ "question": "string", "answer": "string" }],
  "quiz": [{ "question": "string", "choices": ["string", "string", "string", "string"], "correctIndex": 0 }],
  "tip": "string"
}
Provide exactly 5 flashcards and 3 quiz questions. correctIndex is 0-based.
```

---

## 📂 Project Structure

```

study-buddy-ai-5374/
├── .lovable/          # Lovable AI project configuration
├── public/            # Static assets
├── src/               # Application source code
├── supabase/          # Database schema & backend functions
├── .env               # Environment variables (not committed)
├── package.json       # Project dependencies
├── vite.config.ts     # Vite build configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed (or Node.js + npm as an alternative)
- A [Supabase](https://supabase.com) project (URL + Anon Key)

### Installation

```bash
# Clone the repository
git clone https://github.com/suhailahmedaamro786/study-buddy-ai-5374.git
cd study-buddy-ai-5374

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and Anon Key in .env

# Run the development server
bun run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 🖥️ Usage

1. Open the app and **sign up / log in**.
2. Paste your lecture notes, or upload a PDF/photo of your notes.
3. Let the AI generate a **summary**, **flashcards**, and **quiz questions**.
4. Access your saved study sets anytime from your **personal library**.

---

## 🎯 Roadmap

- [ ] Spaced-repetition scheduling for flashcards
- [ ] Collaborative study groups / shared note sets
- [ ] Export summaries to PDF
- [ ] Multi-language note support

---

## 👤 Author

**Suhail Ahmed Aamro**
Freelance Web Developer | ACT AI Program Participant
📍 Dadu, Sindh, Pakistan
🔗 [GitHub](https://github.com/suhailahmedaamro786) · [Portfolio](https://skaamro.vercel.app)

---

## 📄 License

This project was developed as a capstone submission for the **ACT AI Program (HEC / AI SkillBridge / PMYP)**. © 2026 Suhail Ahmed Aamro. All rights reserved.

```
