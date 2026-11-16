// Single source of truth for every piece of content on the site.
// Edit this file to update the portfolio; components render from it.

export type EvidenceId = "turing" | "iqube" | "posttrain" | "nlsql" | "debugger" | "solar";

export const evidenceLabels: Record<EvidenceId, { title: string; kind: string }> = {
  turing: { title: "Turing AI", kind: "Experience" },
  iqube: { title: "IQube Innovation Center", kind: "Internship" },
  posttrain: { title: "Text-to-SQL Post-Training", kind: "Project" },
  nlsql: { title: "Natural Language SQL Agent", kind: "Project" },
  debugger: { title: "AI Code Debugger", kind: "Project" },
  solar: { title: "Solar Energy Efficiency", kind: "Project" },
};

export const profile = {
  name: "Kapil Adhithya N",
  firstName: "Kapil",
  lastName: "Adhithya N",
  headline: "AI/ML Engineer · Frontier Model Evaluation",
  roles: ["AI/ML Engineer", "Frontier Model Evaluation", "RLHF · SFT · Agentic tasks"],
  tagline: "I evaluate frontier AI models and build LLM systems that let people talk to their data.",
  status: "Currently @ Turing AI, evaluating frontier models",
  statusShort: "Now @ Turing AI · Model evaluation",
  email: "kapiladhithya@gmail.com",
  github: "https://github.com/zimbaan",
  linkedin: "https://www.linkedin.com/in/kapil-adhithya-6a7324236",
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
};

// About-section copy. Wrap a phrase in **double asterisks** to highlight it.
export const summary = [
  "I'm an AI/ML engineer working on **frontier model evaluation** at Turing AI, using **RLHF** and **supervised fine-tuning (SFT)** workflows to find where today's models fall short.",
  "I also build LLM systems end to end: a **text-to-SQL post-training pipeline** (LoRA SFT and execution-verified DPO with Hugging Face TRL), a **natural-language-to-SQL agent** on LangChain, Ollama, and FastAPI, and an **AI code debugger** powered by StarCoder.",
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
  { kind: "number", value: 25, decimals: 0, suffix: "%", label: "Higher output, pod I led" },
  { kind: "number", value: 18.2, decimals: 1, suffix: "%", label: "Solar output gain" },
  { kind: "text", value: "Best Outgoing", label: "Student of the department" },
];

export type Skill = { name: string; usedIn: EvidenceId[] };
export type SkillCategory = { id: string; name: string; short: string; skills: Skill[] };

export const skillCategories: SkillCategory[] = [
  {
    id: "eval",
    name: "LLM Evaluation & Training",
    short: "LLM Eval",
    skills: [
      { name: "RLHF", usedIn: ["turing"] },
      { name: "SFT", usedIn: ["turing", "posttrain"] },
      { name: "DPO", usedIn: ["posttrain"] },
      { name: "LoRA / PEFT", usedIn: ["posttrain"] },
      { name: "Evaluation harnesses", usedIn: ["posttrain"] },
      { name: "Frontier model evaluation", usedIn: ["turing"] },
      { name: "Agentic tasks", usedIn: ["turing"] },
      { name: "STEM", usedIn: [] },
    ],
  },
  {
    id: "genai",
    name: "LLM Applications",
    short: "GenAI",
    skills: [
      { name: "LangChain", usedIn: ["nlsql", "debugger"] },
      { name: "Ollama", usedIn: ["nlsql"] },
      { name: "Hugging Face", usedIn: ["posttrain", "debugger"] },
      { name: "LLM integration", usedIn: ["nlsql", "debugger"] },
      { name: "Prompt engineering", usedIn: ["debugger"] },
      { name: "Text-to-SQL", usedIn: ["nlsql"] },
      { name: "Contextual memory", usedIn: ["nlsql"] },
    ],
  },
  {
    id: "ml",
    name: "Machine Learning",
    short: "ML",
    skills: [
      { name: "PyTorch", usedIn: ["posttrain"] },
      { name: "Predictive modeling", usedIn: ["iqube"] },
      { name: "Linear Regression", usedIn: ["iqube"] },
      { name: "Random Forest", usedIn: ["iqube"] },
      { name: "XGBoost", usedIn: ["iqube"] },
      { name: "Feature engineering", usedIn: ["iqube"] },
      { name: "Hyperparameter tuning", usedIn: ["iqube"] },
      { name: "Risk segmentation", usedIn: ["iqube"] },
    ],
  },
  {
    id: "data",
    name: "Data Analysis",
    short: "Data",
    skills: [
      { name: "Pandas", usedIn: ["solar"] },
      { name: "NumPy", usedIn: ["solar"] },
      { name: "Trend analysis", usedIn: ["solar"] },
      { name: "Statistical evaluation", usedIn: ["iqube"] },
      { name: "Correlation analysis", usedIn: ["iqube"] },
      { name: "Outlier detection", usedIn: ["iqube"] },
      { name: "Data visualization", usedIn: ["nlsql"] },
    ],
  },
  {
    id: "lang",
    name: "Languages & Databases",
    short: "Lang / DB",
    skills: [
      { name: "Python", usedIn: ["iqube", "posttrain", "nlsql", "solar"] },
      { name: "SQL", usedIn: ["posttrain", "nlsql", "solar"] },
      { name: "C/C++", usedIn: [] },
      { name: "Java", usedIn: [] },
      { name: "MySQL", usedIn: [] },
      { name: "MongoDB", usedIn: ["nlsql"] },
    ],
  },
  {
    id: "tools",
    name: "Frameworks & Tools",
    short: "Tools",
    skills: [
      { name: "FastAPI", usedIn: ["nlsql"] },
      { name: "Node.js", usedIn: ["debugger"] },
      { name: "Express", usedIn: ["debugger"] },
      { name: "React", usedIn: ["nlsql", "debugger"] },
      { name: "Recharts", usedIn: ["nlsql"] },
      { name: "Tailwind CSS", usedIn: ["nlsql"] },
      { name: "Git", usedIn: [] },
      { name: "VS Code", usedIn: [] },
    ],
  },
];

export const marquee = [
  "Python",
  "PyTorch",
  "RLHF",
  "SFT",
  "DPO",
  "LangChain",
  "Ollama",
  "Hugging Face",
  "FastAPI",
  "MongoDB",
  "SQL",
  "MySQL",
  "Pandas",
  "NumPy",
  "XGBoost",
  "React",
  "Node.js",
  "Recharts",
  "Tailwind CSS",
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
    start: "Jul 2024",
    end: "Present",
    current: true,
    points: [
      "Contributed to Anthropic's CUA project by evaluating frontier models on complex tasks through RLHF workflows, and created agentic conversations for OpenAI evaluations to uncover model limitations.",
      "Led a five-person pod delivering model-evaluation tasks, coordinating the team's work and keeping deliverables aligned with project requirements. The pod achieved 25% higher output than typical teams.",
      "Created realistic, human-centered task examples for Google's Astra SBS project, supporting supervised fine-tuning (SFT) with data based on real-world user scenarios.",
    ],
    tags: ["RLHF", "SFT", "Frontier model evaluation", "Agentic tasks", "Team lead"],
  },
  {
    id: "iqube",
    role: "AI & ML Intern",
    company: "IQube Innovation Center",
    start: "Jan 2024",
    end: "Mar 2024",
    current: false,
    points: [
      "Performed insurance claim analysis using predictive modeling, risk segmentation, and statistical evaluation to identify high-cost customer segments and key health risk factors.",
      "Applied correlation analysis, outlier detection, and feature engineering to improve model accuracy.",
      "Compared Linear Regression, Random Forest, and XGBoost models in data-driven experiments and optimized performance through hyperparameter tuning.",
    ],
    tags: ["Predictive modeling", "XGBoost", "Feature engineering", "Statistics"],
  },
];

export type Project = {
  id: "posttrain" | "nlsql" | "debugger" | "solar";
  title: string;
  dates: string;
  blurb: string;
  points: string[];
  stack: string[];
  flowLabel: string;
  flow: string[];
  repo: string | null;
};

export const projects: Project[] = [
  {
    id: "posttrain",
    title: "Text-to-SQL Post-Training: SFT + DPO",
    dates: "Nov 2026 – Present",
    blurb:
      "A post-training pipeline that teaches a small open model to write SQL with LoRA SFT, then trains it further with DPO on preference pairs checked by actually running the queries.",
    points: [
      "Built an end-to-end post-training pipeline for Qwen2.5-Coder-0.5B-Instruct on the Spider text-to-SQL benchmark: LoRA SFT with Hugging Face TRL, then DPO on preference pairs mined from the model's own outputs.",
      "Generated execution-verified preference data: the SFT model samples 8 queries per held-out question, each runs in a read-only SQLite sandbox, and correct vs. incorrect results become chosen / rejected pairs (gold SQL as the fallback).",
      "Built an execution-accuracy evaluation harness with per-query-type breakdowns, and designed ablations on data size, SFT vs. SFT + DPO, and a control that spends the DPO questions on extra SFT instead.",
    ],
    stack: ["PyTorch", "Hugging Face TRL", "PEFT / LoRA", "Transformers", "Qwen2.5-Coder", "SQLite"],
    flowLabel: "How the training loop runs",
    flow: [
      "Spider train split",
      "LoRA SFT (TRL)",
      "Sample 8 queries",
      "Execute + verify",
      "Preference pairs",
      "DPO (TRL)",
      "Execution accuracy",
    ],
    repo: "https://github.com/zimbaan/text2sql-post-training",
  },
  {
    id: "nlsql",
    title: "Natural Language SQL Agent",
    dates: "Aug 2025 – Oct 2025",
    blurb:
      "An AI-driven agent that turns plain-English questions into optimized, executable SQL across multiple database environments.",
    points: [
      "Developed an AI-driven SQL generation system that converts natural language queries into optimized, executable SQL statements, supporting multi-database environments.",
      "Designed a visualization module that shows table relationships and data insights through interactive graphs and charts, with secure user authentication and access control.",
      "Improved query generation accuracy through contextual memory in MongoDB, using LangChain + Ollama for LLM integration, FastAPI for backend orchestration, and React + Recharts + Tailwind CSS for front-end analytics.",
    ],
    stack: ["LangChain", "Ollama", "FastAPI", "MongoDB", "React", "Recharts", "Tailwind CSS"],
    flowLabel: "How a request flows",
    flow: ["Question", "FastAPI + auth", "LangChain", "MongoDB memory", "Ollama LLM", "SQL", "Database", "Recharts"],
    repo: null,
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
    flowLabel: "How a request flows",
    flow: [
      "Code snippet (React UI)",
      "Express REST API",
      "LangChain prompt template",
      "StarCoder (Hugging Face)",
      "Fix + explanation",
    ],
    repo: "https://github.com/zimbaan/ai-code-debugger",
  },
  {
    id: "solar",
    title: "Solar Energy Efficiency Optimization",
    dates: "Dec 2023 – Mar 2024",
    blurb:
      "A study of 50,000+ climate and power readings that traced lost solar output to dust, and a cleaning plan that won it back.",
    points: [
      "Processed and analysed 50,000+ data points on climate conditions (temperature, humidity, solar radiation) and solar power output using Python (Pandas, NumPy) and SQL to uncover efficiency trends.",
      "Identified a 17.5% average efficiency drop caused by dust accumulation and irregular maintenance, leading to a data-driven maintenance strategy that increased panel output by 18.2%.",
      "Implemented a water-cleaning system for regular maintenance, saving the college ₹15K a year in infrastructure costs.",
    ],
    stack: ["Python", "Pandas", "NumPy", "SQL"],
    flowLabel: "How the analysis ran",
    flow: ["Climate + output data", "SQL", "Pandas / NumPy", "Trend analysis", "Dust-loss finding", "Cleaning schedule"],
    repo: null,
  },
];

export const education = {
  school: "Kumaraguru College of Technology",
  degree: "B.Tech. in Information Technology",
  start: "Dec 2021",
  end: "Apr 2025",
  cgpa: 8.74,
  coursework: [
    "Machine Learning",
    "Data Mining",
    "Data Structures & Algorithms",
    "Databases",
    "Software Engineering",
    "Object-Oriented Programming",
    "Operating Systems",
    "Computer Networks",
    "Discrete Mathematics",
  ],
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
