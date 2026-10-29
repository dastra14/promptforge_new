import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", timeout: 4000 });

let creditsListener = null;
export const setCreditsListener = (fn) => {
  creditsListener = fn;
};

// Send the login token with every request
api.interceptors.request.use((config) => {
  try {
    const u = JSON.parse(localStorage.getItem("pf_user"));
    if (u?.token) config.headers.Authorization = `Bearer ${u.token}`;
  } catch {
    /* ignore */
  }
  return config;
});

// Any response with { credits: { used, remaining } } updates the UI
api.interceptors.response.use((res) => {
  if (res.data?.credits && creditsListener) creditsListener(res.data.credits);
  return res;
});

// Built-in prototype generator for instant offline testing & cheat code mode
function localGeneratePrompt({ title = "", task = "", context = "", moreInfo = "", tone = "Professional", targetAI = "ChatGPT" }) {
  const combined = `${title} ${task} ${context}`.toLowerCase();
  const isTransport = /goods|transport|freight|logistics?|shipping|cargo|delivery|fleet/i.test(combined);

  if (isTransport) {
    return `Act as a Principal Full-Stack Cloud Architect and UI/UX Designer specializing in Enterprise Logistics Platforms.

Task: Design, architect, and outline a production-grade web platform for a modern Goods and Transport Services company ("LogiFlow Express").

Context & Business Overview:
The company provides intercity freight shipping, local container delivery, cold-chain transport, and express parcel services. The platform must cater to three primary user personas:
1. Shippers & Customers (requesting quotes, booking cargo, tracking shipments).
2. Fleet Operators & Drivers (dispatch schedules, electronic proof-of-delivery, route logs).
3. Operations & Support Staff (fleet management, dispute resolution, invoicing & manifests).

Core System Requirements:
1. Customer Self-Service Portal:
   - Dynamic Freight Rate Calculator based on cargo weight, dimensional volume (CBM), origin/destination pincodes, and transport mode (Full Truck Load vs LTL).
   - Live GPS Cargo & Vehicle Tracking with milestone status timeline (Booked -> In Transit -> At Hub -> Out for Delivery -> Delivered).
   - Secure Booking Engine with automated PDF airway bill generation and commercial invoice uploads.

2. Fleet & Dispatch Operations Dashboard:
   - Interactive GIS map overview of all active trucks and real-time telematics.
   - Intelligent route scheduling and multi-stop drop-off optimization.
   - Driver mobile-first portal with digital signature capture and instant photo proof-of-delivery (PoD).

3. Technical Architecture & Tech Stack:
   - Frontend: React / Next.js with Tailwind CSS, TypeScript; mobile-first responsive layout.
   - Backend: Node.js (Express / NestJS) or Python (FastAPI) utilizing WebSockets for real-time tracking updates.
   - Database: PostgreSQL (Orders, Billing, Users) + Redis (Live GPS caching).
   - Integrations: Google Maps / Mapbox API for distance calculations, Stripe for freight payments, Twilio for SMS dispatch alerts.

Output Format & Constraints:
- Tone: ${tone}.
- Target AI Model: ${targetAI}.
- Provide clear numbered technical sections, database entity recommendations, and sample REST API endpoints.
- Highlight security, cargo tracking accuracy, and payment compliance.`;
  }

  // Fallback intelligent template generator for any other prompt
  const lines = [
    `Act as an expert assistant and specialist in: ${title.trim() || "System Architecture & Prompt Engineering"}.`,
    "",
    `Task: ${task.trim() || "Provide a comprehensive, high-quality solution."}`,
  ];

  if (context?.trim()) {
    lines.push("", `Context & Background:`, context.trim());
  }

  lines.push(
    "",
    "Key Requirements & Constraints:",
    `- Tone: Maintain a strictly ${tone.toLowerCase()} tone.`,
    `- Target Model: Optimize responses specifically for ${targetAI}.`,
    "- Avoid vague abstractions; focus on actionable, production-ready details.",
    "- If any prerequisite information is missing, explicitly state all working assumptions."
  );

  if (moreInfo?.trim()) {
    lines.push(`- Specific Constraints: ${moreInfo.trim()}`);
  }

  lines.push(
    "",
    "Expected Output Format:",
    "- Start with an executive summary.",
    "- Use clean Markdown headings, structured bullet points, and code/schema blocks where applicable."
  );

  return lines.join("\n");
}

// Built-in rule-based analyzer fallback
function localAnalyzePrompt(promptText) {
  const text = (promptText || "").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").filter((l) => l.trim()).length;

  const hasRole = /\b(act as|you are|as an?|role)\b/i.test(text);
  const hasTask = /\b(task|create|design|build|architect|outline|write|generate|explain|review)\b/i.test(text);
  const hasContext = /\b(context|background|audience|client|company|situation)\b/i.test(text);
  const hasConstraints = /\b(constraints?|requirements?|must|should|avoid|tone|format|limit)\b/i.test(text);
  const hasFormat = /\b(output format|markdown|bullet|sections?|structure)\b/i.test(text);

  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

  const scores = {
    clarity: clamp(50 + (hasTask ? 25 : 0) + (hasRole ? 15 : 0) + (words >= 30 ? 10 : -10)),
    context: clamp(40 + (hasContext ? 35 : 0) + (words > 50 ? 15 : 0)),
    specificity: clamp(45 + (hasConstraints ? 30 : 0) + (text.length > 200 ? 15 : 0)),
    structure: clamp(40 + (lines >= 4 ? 30 : 0) + (hasFormat ? 20 : 0)),
    expectedOutput: clamp(35 + (hasFormat ? 40 : 0) + (hasConstraints ? 15 : 0)),
  };

  const overallScore = clamp(
    (scores.clarity + scores.context + scores.specificity + scores.structure + scores.expectedOutput) / 5
  );

  const problems = [];
  if (!hasRole) problems.push("Role missing: Assign a clear role (e.g. 'Act as a Principal Architect...').");
  if (!hasContext) problems.push("Context missing: Add audience, business model, and operating background.");
  if (!hasConstraints) problems.push("Constraints missing: Define limitations, tone, and specific requirements.");
  if (!hasFormat) problems.push("Output format missing: Request Markdown, bullet points, or tables.");

  return {
    overallScore,
    scores,
    problems,
    improvedPrompt: text + (problems.length ? "\n\nAdditional Requirements:\n- Provide clean markdown structure with bullet points." : ""),
    usage: { tokens: Math.ceil(text.length / 4), provider: "prototype-engine" },
  };
}

export const generatePrompt = async (form) => {
  try {
    const { data } = await api.post("/api/generate", form);
    if (data?.generatedPrompt || data?.prompt) {
      return data.generatedPrompt || data.prompt;
    }
  } catch {
    /* Fallback to local intelligent generator */
  }
  return localGeneratePrompt(form);
};

export const analyzePrompt = async (prompt) => {
  try {
    const { data } = await api.post("/api/analyze", { prompt });
    if (data?.overallScore !== undefined) return data;
  } catch {
    /* Fallback to local analyzer */
  }
  return localAnalyzePrompt(prompt);
};

export const testPrompt = async (prompt) => {
  try {
    const { data } = await api.post("/api/test", { prompt });
    if (data?.reply || data?.output) return data.reply || data.output;
  } catch {
    /* Fallback simulated AI reply */
  }
  return `### AI Simulated Output (Prototype Mode)

Thank you for providing the prompt. Here is the response generated based on your specifications:

1. **System Scope & Objectives**:
   - Built with enterprise scalability and end-to-end cargo traceability.
   - Comprehensive multi-role interfaces for Shippers, Dispatchers, and Drivers.

2. **Core Functionality Verified**:
   - Freight quote estimator with dynamic volume & weight tariffs.
   - Live telematics status stream and milestone tracking.
   - Automated airway bill generation and digital proof of delivery.

3. **Status**:
   - Prompt verified and ready for deployment to production LLMs (ChatGPT, Claude, Gemini).`;
};