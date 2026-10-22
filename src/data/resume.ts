// Single source of truth for every piece of content on the site.
// Edit this file to update the portfolio; components render from it.

export type EvidenceId = "turing" | "iqube" | "nlsql" | "debugger";

export const evidenceLabels: Record<EvidenceId, { title: string; kind: string }> = {
  turing: { title: "Turing AI", kind: "Experience" },
  iqube: { title: "IQube Innovation Center", kind: "Internship" },
  nlsql: { title: "Natural Language SQL Agent", kind: "Project" },
  debugger: { title: "AI Code Debugger", kind: "Project" },
};

export const profile = {
  name: "Kapil Adhithya N",
  firstName: "Kapil",
  lastName: "Adhithya N",
  headline: "AI/ML Engineer · LLM & RAG Developer",
  roles: ["AI/ML Engineer", "LLM & RAG Developer", "LangChain · PyTorch · FastAPI"],
  tagline: "I build LLM-powered systems that let people talk to their data.",
  status: "Currently @ Turing AI, supporting LLM fine-tuning",
  statusShort: "Now @ Turing AI · LLM fine-tuning",
  email: "kapiladhithya@gmail.com",
  github: "https://github.com/zimbaan",
  linkedin: "https://www.linkedin.com/in/kapil-adhithya-6a7324236",
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
};

// About-section copy. Wrap a phrase in **double asterisks** to highlight it.
export const summary = [
  "I'm an AI/ML developer with hands-on experience building **LLM and RAG applications**, **machine learning models**, and **REST APIs** in Python.",
  "I built a **natural-language-to-SQL agent** with LangChain, ChromaDB, and prompt engineering, and developed **regression models for insurance claim prediction** through feature engineering and hyperparameter tuning.",
];

const img = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

export const portrait = {
  alt: "Kapil Adhithya N in a black suit, smiling",
  // Background removed on-device (Apple Vision), edges cleaned, graded to the site palette
  // (cool violet shadows, violet/cyan rim light), exported as transparent WebP.
  srcSet: [480, 800, 1100].map((w) => `${img(`kapil-cutout-${w}.webp`)} ${w}w`).join(", "),
  src: img("kapil-cutout-800.webp"),
  width: 800,
  height: 881,
  // 24px-wide blurred silhouette, shown while the real photo loads.
  placeholder:
    "data:image/webp;base64,UklGRgQDAABXRUJQVlA4WAoAAAAwAAAAFwAAGQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBIZQAAAAF3oESSpDZ7OZAdGom6iAjAI79uvTNDEMEokiQpE/xukIIEpKAECWhACYEEJNzfMjEzuxurIKL/EyDxEADszgbgnKqzhiBRpXMBRZAkmaDzBPBmoLMO9Kp+XJELfwkigtzGoCsLAFZQOCCoAAAAEAUAnQEqGAAaAD7RYKhPqCUjoigIAQAaCWUAzFmKyFlexzrIt1197pibWoFCcKZawAD29Pxh/plHztJLfCGQkAaWube5JmUY1XVu5ZVFiPjkCt9meXvaqd38oH1wIcwGntSHmov34i9LoQJTBYynupm6Tau1ei2PXmnO4OWMc0i/mhvULwFcBxRFieS8FYUAx4/7eYJ/1jvwm002RmMs+e1DB3PwAAAA",
};

export type Stat =
  | { kind: "number"; value: number; decimals: number; suffix?: string; label: string }
  | { kind: "text"; value: string; label: string };

export const stats: Stat[] = [
  { kind: "number", value: 8.74, decimals: 2, suffix: "/10", label: "CGPA, B.Tech IT" },
  { kind: "number", value: 2, decimals: 0, label: "Industry roles" },
  { kind: "number", value: 2, decimals: 0, label: "LLM projects built" },
  { kind: "text", value: "Best Outgoing", label: "Student of the department" },
];

export type Skill = { name: string; usedIn: EvidenceId[] };
export type SkillCategory = { id: string; name: string; short: string; skills: Skill[] };

export const skillCategories: SkillCategory[] = [
  {
    id: "genai",
    name: "Generative AI & NLP",
    short: "GenAI",
    skills: [
      { name: "LLM applications", usedIn: ["nlsql", "debugger"] },
      { name: "RAG", usedIn: ["nlsql"] },
      { name: "Prompt engineering", usedIn: ["nlsql", "debugger"] },
      { name: "LangChain", usedIn: ["nlsql", "debugger"] },
      { name: "Hugging Face", usedIn: ["debugger"] },
      { name: "Ollama", usedIn: ["nlsql"] },
      { name: "Text-to-SQL", usedIn: ["nlsql"] },
      { name: "Contextual memory", usedIn: ["nlsql"] },
      { name: "LLM fine-tuning support", usedIn: ["turing"] },
    ],
  },
  {
    id: "ml",
    name: "Machine Learning & Deep Learning",
    short: "ML / DL",
    skills: [
      { name: "PyTorch", usedIn: ["turing"] },
      { name: "TensorFlow", usedIn: ["turing"] },
      { name: "scikit-learn", usedIn: ["iqube"] },
      { name: "XGBoost", usedIn: ["iqube"] },
      { name: "Linear Regression", usedIn: ["iqube"] },
      { name: "Random Forest", usedIn: ["iqube"] },
      { name: "Classification", usedIn: [] },
      { name: "Clustering", usedIn: [] },
      { name: "Feature engineering", usedIn: ["iqube"] },
      { name: "Hyperparameter tuning", usedIn: ["iqube"] },
      { name: "Model evaluation", usedIn: ["iqube"] },
    ],
  },
  {
    id: "data",
    name: "Data Analysis",
    short: "Data",
    skills: [
      { name: "Pandas", usedIn: ["iqube"] },
      { name: "NumPy", usedIn: ["iqube"] },
      { name: "Statistical analysis", usedIn: ["iqube"] },
      { name: "Correlation analysis", usedIn: ["iqube"] },
      { name: "Outlier detection", usedIn: ["iqube"] },
      { name: "Data visualization", usedIn: ["turing", "nlsql"] },
    ],
  },
  {
    id: "api",
    name: "APIs & Deployment",
    short: "APIs",
    skills: [
      { name: "FastAPI", usedIn: ["nlsql"] },
      { name: "Node.js", usedIn: ["debugger"] },
      { name: "Express", usedIn: ["debugger"] },
      { name: "REST APIs", usedIn: ["nlsql", "debugger"] },
      { name: "Model serving", usedIn: ["nlsql", "debugger"] },
      { name: "WebSockets", usedIn: [] },
    ],
  },
  {
    id: "lang",
    name: "Languages & Databases",
    short: "Lang / DB",
    skills: [
      { name: "Python", usedIn: ["turing", "iqube", "nlsql"] },
      { name: "SQL", usedIn: ["nlsql"] },
      { name: "JavaScript", usedIn: ["nlsql", "debugger"] },
      { name: "C/C++", usedIn: [] },
      { name: "Java", usedIn: [] },
      { name: "MySQL", usedIn: ["nlsql"] },
      { name: "MongoDB", usedIn: ["nlsql"] },
      { name: "ChromaDB", usedIn: ["nlsql"] },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    short: "Tools",
    skills: [
      { name: "Git", usedIn: [] },
      { name: "VS Code", usedIn: [] },
      { name: "React", usedIn: ["nlsql", "debugger"] },
      { name: "Recharts", usedIn: ["nlsql"] },
      { name: "Tailwind CSS", usedIn: ["nlsql"] },
      { name: "SDLC", usedIn: [] },
    ],
  },
];

export const marquee = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "LangChain",
  "Hugging Face",
  "Ollama",
  "ChromaDB",
  "scikit-learn",
  "XGBoost",
  "FastAPI",
  "Pandas",
  "NumPy",
  "MongoDB",
  "MySQL",
  "React",
  "Node.js",
];

export type Experience = {
  id: EvidenceId;
  role: string;
  company: string;
  start: string;
  end: string;
  current: boolean;
  points: string[];
  tags: string[];
};

export const experience: Experience[] = [
  {
    id: "turing",
    role: "Data Analyst",
    company: "Turing AI",
    start: "Jul 2025",
    end: "Present",
    current: true,
    points: [
      "Reviewed and corrected model responses for the Gemini AI Code project to support model fine-tuning, checking each output for accuracy and alignment with project objectives.",
      "Created visualization-focused datasets for a Google project.",
      "Handled machine learning, deep learning (PyTorch, TensorFlow), and automation tasks.",
    ],
    tags: ["LLM fine-tuning", "PyTorch", "TensorFlow", "Data visualization"],
  },
  {
    id: "iqube",
    role: "AI & ML Intern",
    company: "IQube Innovation Center",
    start: "Jan 2024",
    end: "Mar 2024",
    current: false,
    points: [
      "Analyzed insurance claim data with predictive modeling, risk segmentation, and statistical evaluation to identify high-cost customer segments and key health risk factors.",
      "Improved claim prediction accuracy through correlation analysis, outlier detection, and feature engineering.",
      "Compared Linear Regression, Random Forest, and XGBoost models and tuned their hyperparameters.",
    ],
    tags: ["Regression", "XGBoost", "Feature engineering", "Statistics"],
  },
];

export type Project = {
  id: "nlsql" | "debugger";
  title: string;
  dates: string;
  blurb: string;
  points: string[];
  stack: string[];
  flow: string[];
  repo: string | null;
};

export const projects: Project[] = [
  {
    id: "nlsql",
    title: "Natural Language SQL Agent",
    dates: "Aug 2025 – Oct 2025",
    blurb:
      "An LLM-powered agent that turns plain-English questions into optimized, executable SQL across multiple database environments.",
    points: [
      "Built an LLM-powered system that converts natural language queries into optimized, executable SQL statements across multiple database environments, using LangChain with Ollama for LLM integration.",
      "Added retrieval-augmented generation (RAG) with ChromaDB and prompt engineering to guide SQL generation, and improved query accuracy using contextual memory stored in MongoDB.",
      "Served the system through FastAPI REST APIs, with a React, Recharts, and Tailwind CSS front end that shows table relationships and data insights through interactive charts, plus user authentication and access control.",
    ],
    stack: ["LangChain", "Ollama", "ChromaDB", "FastAPI", "MongoDB", "React", "Recharts", "Tailwind CSS"],
    flow: [
      "Question",
      "FastAPI",
      "LangChain",
      "MongoDB memory",
      "ChromaDB schema retrieval",
      "Ollama LLM",
      "SQL",
      "Database",
      "Recharts",
    ],
    repo: null, // TODO: add the GitHub repo URL for the NL SQL Agent
  },
  {
    id: "debugger",
    title: "AI Code Debugger",
    dates: "Feb 2025",
    blurb:
      "An LLM tool that debugs code snippets with Hugging Face's StarCoder and returns fixes with plain-language explanations.",
    points: [
      "Built an LLM tool that debugs code snippets with Hugging Face's StarCoder, returning fixes and explanations.",
      "Wrote the LangChain prompt template and exposed the model via a Node.js/Express REST API with a React UI.",
    ],
    stack: ["LangChain", "Hugging Face", "StarCoder", "Node.js", "Express", "React"],
    flow: [
      "Code snippet (React UI)",
      "Express REST API",
      "LangChain prompt template",
      "StarCoder (Hugging Face)",
      "Fix + explanation",
    ],
    repo: "https://github.com/zimbaan/ai-code-debugger",
  },
];

export const education = {
  school: "Kumaraguru College of Technology",
  degree: "B.Tech. in Information Technology",
  start: "Dec 2021",
  end: "Apr 2025",
  cgpa: 8.74,
  coursework: ["Machine Learning", "Data Mining", "Data Structures & Algorithms", "Databases", "Discrete Mathematics"],
};

export const awards = [
  {
    icon: "trophy",
    title: "Best Outgoing Student",
    detail: "All-Rounder of the Department, Information Technology (2021–2025)",
  },
  {
    icon: "medal",
    title: "Mahatma Gandhi Scholarship",
    detail: "Awarded for academic excellence in the pre-final and final years",
  },
  {
    icon: "award",
    title: "IBM Certification",
    detail: "Data Analytics using Python",
  },
] as const;

export const sections = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;
