// Enterprise Mock Database for NexusRAG
export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  chunkCount: number;
  embeddingModel: string;
  vectorDb: string;
  sizeBytes: number;
  createdAt: string;
  accuracy: number; // e.g. 0.982
  successRate: number; // e.g. 0.995
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  kbId: string;
  kbName: string;
  sizeBytes: number;
  chunkCount: number;
  uploadDate: string;
  status: 'ingesting' | 'parsing' | 'chunked' | 'vectorized' | 'failed';
  tags: string[];
  author: string;
  metadata: {
    title: string;
    description: string;
    [key: string]: any;
  };
  content?: string; // Mock text content for previewing
}

export interface QueryLog {
  id: string;
  query: string;
  response: string;
  latencyMs: number;
  accuracy: number;
  timestamp: string;
  kbName: string;
  tokensUsed: number;
  feedback?: 'positive' | 'negative';
  steps: {
    agent: string;
    action: string;
    status: 'completed' | 'processing' | 'pending';
    durationMs: number;
    logs: string[];
  }[];
  sources: {
    title: string;
    chunkId: string;
    score: number;
    snippet: string;
  }[];
}

// Initial Mock Seed Data
export const INITIAL_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 'kb-ai-research',
    name: 'AI Research',
    description: 'Academic papers on transformer architectures, sparse attention mechanisms, and deep reasoning models.',
    documentsCount: 6,
    chunkCount: 1420,
    embeddingModel: 'text-embedding-3-large',
    vectorDb: 'Qdrant Cloud',
    sizeBytes: 15400000, // 15.4 MB
    createdAt: '2026-04-12T10:30:00Z',
    accuracy: 97.4,
    successRate: 99.1,
  },
  {
    id: 'kb-medical-docs',
    name: 'Medical Documents',
    description: 'Clinical trials, diagnostics manuals, pharmacology sheets, and patient treatment protocol guidelines.',
    documentsCount: 12,
    chunkCount: 3840,
    embeddingModel: 'text-embedding-3-large',
    vectorDb: 'Pinecone Serverless',
    sizeBytes: 42100000, // 42.1 MB
    createdAt: '2026-05-01T14:20:00Z',
    accuracy: 98.2,
    successRate: 98.5,
  },
  {
    id: 'kb-company-knowledge',
    name: 'Company Knowledge',
    description: 'Internal wiki, HR policies, engineering playbooks, code guidelines, and product roadmap documentation.',
    documentsCount: 24,
    chunkCount: 8120,
    embeddingModel: 'text-embedding-3-small',
    vectorDb: 'Local PGVector',
    sizeBytes: 12300000, // 12.3 MB
    createdAt: '2026-02-15T09:00:00Z',
    accuracy: 95.8,
    successRate: 97.0,
  },
  {
    id: 'kb-tech-docs',
    name: 'Technical Documentation',
    description: 'API specs, deployment scripts, system architectures, cloud infrastructure configuration manuals.',
    documentsCount: 15,
    chunkCount: 4200,
    embeddingModel: 'cohere-embed-v3',
    vectorDb: 'Qdrant Cloud',
    sizeBytes: 19800000, // 19.8 MB
    createdAt: '2026-05-20T16:45:00Z',
    accuracy: 96.5,
    successRate: 98.0,
  }
];

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-transformer',
    name: 'attention_is_all_you_need.pdf',
    type: 'pdf',
    kbId: 'kb-ai-research',
    kbName: 'AI Research',
    sizeBytes: 2100000, // 2.1 MB
    chunkCount: 145,
    uploadDate: '2026-04-12T10:35:00Z',
    status: 'vectorized',
    tags: ['Transformer', 'Attention', 'Deep Learning'],
    author: 'Ashish Vaswani et al.',
    metadata: {
      title: 'Attention Is All You Need',
      description: 'The seminal paper introducing the transformer architecture, replacing RNNs and CNNs with self-attention mechanism.',
      keywords: 'self-attention, encoder-decoder, machine translation'
    },
    content: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.`
  },
  {
    id: 'doc-reasoning',
    name: 'deep_reasoning_llms_survey.pdf',
    type: 'pdf',
    kbId: 'kb-ai-research',
    kbName: 'AI Research',
    sizeBytes: 3400000, // 3.4 MB
    chunkCount: 280,
    uploadDate: '2026-04-20T11:15:00Z',
    status: 'vectorized',
    tags: ['Reasoning', 'Reinforcement Learning', 'Search'],
    author: 'DeepMind Research',
    metadata: {
      title: 'A Survey on Deep Reasoning in Large Language Models',
      description: 'Analysis of test-time compute, chain-of-thought, and reinforcement learning strategies in modern LLMs.',
      keywords: 'MCTS, RLHF, chain of thought, inference scaling'
    },
    content: `This survey provides a comprehensive review of recent developments in enhancing reasoning capabilities of LLMs. We distinguish between System 1 (fast, intuitive) and System 2 (slow, deliberate) processing. We categorize methodologies into: (1) Prompt-based reasoning (CoT, ToT), (2) Process-supervised reinforcement learning (PRMs), and (3) Inference-time search (MCTS, Beam Search). Finally, we discuss open challenges such as hallucinations, cost of test-time compute, and evaluation frameworks.`
  },
  {
    id: 'doc-oncology',
    name: 'oncology_treatment_protocols_2026.docx',
    type: 'docx',
    kbId: 'kb-medical-docs',
    kbName: 'Medical Documents',
    sizeBytes: 5200000,
    chunkCount: 450,
    uploadDate: '2026-05-01T14:30:00Z',
    status: 'vectorized',
    tags: ['Oncology', 'Protocols', 'Cancer Care'],
    author: 'Dr. Sarah Jenkins',
    metadata: {
      title: 'Oncology Treatment Protocols 2026',
      description: 'Standardized operational procedures for chemotherapy dosing schedules and combination immunotherapy recipes.',
      keywords: 'chemotherapy, immunotherapy, dosage, patient care'
    },
    content: `This clinical guidelines document outlines chemotherapy and immunotherapy dosing regimens for Stage III and IV solid tumors. Protocols specify baseline blood count requirements, dosage calculations based on Body Surface Area (BSA), pre-medication infusions (e.g., anti-emetics), and cycle frequencies. Section 4 highlights combination regimens of Pembrolizumab with Platinum-doublet chemotherapy, including adverse event management criteria.`
  },
  {
    id: 'doc-handbook',
    name: 'employee_handbook_2026.md',
    type: 'md',
    kbId: 'kb-company-knowledge',
    kbName: 'Company Knowledge',
    sizeBytes: 154000,
    chunkCount: 52,
    uploadDate: '2026-02-15T09:12:00Z',
    status: 'vectorized',
    tags: ['HR', 'Handbook', 'Onboarding'],
    author: 'People Ops Team',
    metadata: {
      title: 'NexusRAG Employee Handbook 2026',
      description: 'Comprehensive guidelines on company culture, core values, PTO guidelines, and remote work policies.',
      keywords: 'benefits, vacation, core hours, remote work, equipment'
    },
    content: `# Welcome to NexusRAG!
This handbook is designed to help you navigate your journey with us. 
## Core Values
1. **Radical Transparency:** We share drafts early, default to public channels, and document design choices.
2. **First-Principles Thinking:** Don't do things just because they've always been done that way. Deconstruct problems to their core truths.
3. **Extreme Ownership:** You own your projects end-to-end. Take responsibility for failures and success.
## Remote Work Policy
We are a remote-first, async-friendly company. Our core collaboration window is 10:00 AM to 3:00 PM EST, during which teams are encouraged to schedule synchronous huddles.`
  },
  {
    id: 'doc-playbook',
    name: 'engineering_playbook.md',
    type: 'md',
    kbId: 'kb-company-knowledge',
    kbName: 'Company Knowledge',
    sizeBytes: 250000,
    chunkCount: 95,
    uploadDate: '2026-02-28T14:40:00Z',
    status: 'vectorized',
    tags: ['Engineering', 'Architecture', 'Git'],
    author: 'Principal Architect',
    metadata: {
      title: 'Engineering Playbook & Coding Standards',
      description: 'Git workflows, architectural boundaries, Next.js conventions, and CI/CD pipelines deployment guidelines.',
      keywords: 'PR reviews, test coverage, monorepo, nextjs'
    },
    content: `# NexusRAG Engineering Playbook
This playbook outlines the standards expected of all engineers writing code at NexusRAG.
## Tech Stack
Our primary frontend applications are built with Next.js (App Router), TypeScript, and Tailwind CSS.
## Branching & PRs
- All branch names follow the pattern: \`feature/ticket-title\`, \`bugfix/issue-title\`, or \`refactor/description\`.
- Every Pull Request requires at least one approving review from a code owner.
- Code coverage should not decrease. Write comprehensive unit and integration tests.`
  },
  {
    id: 'doc-qdrant',
    name: 'qdrant_indexing_config.txt',
    type: 'txt',
    kbId: 'kb-tech-docs',
    kbName: 'Technical Documentation',
    sizeBytes: 85000,
    chunkCount: 24,
    uploadDate: '2026-05-21T09:00:00Z',
    status: 'vectorized',
    tags: ['Qdrant', 'Indexing', 'Vectors'],
    author: 'DevOps Lead',
    metadata: {
      title: 'Qdrant Vector Database Indexing Configuration',
      description: 'HNSW index configurations, payload indexing definitions, and memory optimization rules for vectors.',
      keywords: 'hnsw, payload index, memory limit, cosine distance'
    },
    content: `QDRANT COLLECTION CONFIGURATION:
Vector parameters:
- Size: 1536 (matching OpenAI text-embedding-3-small)
- Distance: Cosine

HNSW Config:
- m: 16 (number of edges per node)
- ef_construct: 100 (accuracy during build)
- payload_on_disk: true (store payload on disk to save RAM)

Payload indexes added on:
- "kbId" (keyword, for quick partition filtering)
- "uploadDate" (integer, for date range filters)
- "status" (keyword, active status tracking)`
  },
  {
    id: 'doc-uploading-demo',
    name: 'agentic_rag_evaluation.pdf',
    type: 'pdf',
    kbId: 'kb-ai-research',
    kbName: 'AI Research',
    sizeBytes: 1800000,
    chunkCount: 0,
    uploadDate: '2026-06-11T04:10:00Z',
    status: 'parsing',
    tags: ['Agentic RAG', 'Evaluation'],
    author: 'Self (Uploaded)',
    metadata: {
      title: 'Evaluating Multi-Agent RAG Orchestrations',
      description: 'A study on accuracy, latency, and costs when deploying multi-agent retrieval chains.',
      keywords: 'ragas, trulens, agent evaluation, cost analysis'
    },
    content: `Evaluating multi-agent retrieval frameworks presents unique challenges. Unlike standard single-query RAG, multi-agent frameworks execute multiple child queries, synthesize feedback, and recursively improve responses. We propose a three-dimensional evaluation metric covering: Context Relevance, Answer Groundedness, and Tool call efficiency. Our experimental benchmarks demonstrate that agentic verification layers reduce hallucinations by 34% at the cost of a 2x latency overhead.`
  }
];

export const INITIAL_QUERIES: QueryLog[] = [
  {
    id: 'q-1',
    query: 'What is the body surface area calculation guidelines for cancer patients?',
    response: 'According to the **Medical Documents** database (specifically in [oncology_treatment_protocols_2026.docx](doc-oncology)), Body Surface Area (BSA) calculations are critical for determining chemotherapy and immunotherapy dosages. The standard guideline recommends utilizing the **Mosteller formula**:\n\n$$\\text{BSA} (m^2) = \\sqrt{\\frac{\\text{Height (cm)} \\times \\text{Weight (kg)}}{3600}}$$\n\n### Key Dosing Rules:\n1. **Baseline Thresholds**: Complete blood count (CBC) must show absolute neutrophil count (ANC) $\\ge 1,500/\\mu\\text{L}$ and platelets $\\ge 100,000/\\mu\\text{L}$ prior to infusion.\n2. **Pembrolizumab Combo**: Combination chemotherapy with Pembrolizumab requires a fixed dose of 200mg IV every 3 weeks, alongside platinum-doublet dosing calculated strictly based on BSA.',
    latencyMs: 1820,
    accuracy: 98.5,
    timestamp: '2026-06-11T04:05:00Z',
    kbName: 'Medical Documents',
    tokensUsed: 1420,
    feedback: 'positive',
    steps: [
      {
        agent: 'Orchestrator Planner',
        action: 'Query Analysis & Deconstruction',
        status: 'completed',
        durationMs: 250,
        logs: [
          'Received query: "What is the body surface area calculation guidelines..."',
          'Determined primary target domain: Clinical Oncology / Dosage calculation.',
          'Formulated sub-queries for RAG retriever: ["body surface area formula", "chemotherapy dosage guidelines BSA", "oncology dosing thresholds"]'
        ]
      },
      {
        agent: 'Knowledge Retriever',
        action: 'Semantic Retrieval & Fusion',
        status: 'completed',
        durationMs: 450,
        logs: [
          'Searching collection: "Medical Documents" using text-embedding-3-large.',
          'Retrieved 3 candidate chunks from "oncology_treatment_protocols_2026.docx" with cosine similarity scores: 0.892, 0.865, 0.812.',
          'Extracted Mosteller formula and dosing blood thresholds.'
        ]
      },
      {
        agent: 'Validator Critic',
        action: 'Groundedness & Fact-checking',
        status: 'completed',
        durationMs: 320,
        logs: [
          'Checking synthesized response against retrieved chunks.',
          'Verified: "Mosteller formula" is explicitly stated in source chunk 1.',
          'Verified: Blood count thresholds (ANC >= 1500, platelets >= 100k) match source chunk 2 exactly.',
          'No hallucinations detected.'
        ]
      },
      {
        agent: 'Synthesis Writer',
        action: 'Formatted Output Compilation',
        status: 'completed',
        durationMs: 800,
        logs: [
          'Compiling response into Markdown with LaTeX support for formulas.',
          'Creating bullet points for dosing rules.',
          'Adding source citations for doc-oncology.'
        ]
      }
    ],
    sources: [
      {
        title: 'oncology_treatment_protocols_2026.docx',
        chunkId: 'doc-oncology#chunk-12',
        score: 0.892,
        snippet: 'Body Surface Area (BSA) calculations are critical for determining chemotherapy. Use the Mosteller formula: BSA = square root of (Height (cm) x Weight (kg) / 3600).'
      },
      {
        title: 'oncology_treatment_protocols_2026.docx',
        chunkId: 'doc-oncology#chunk-15',
        score: 0.865,
        snippet: 'Prior to administering infusion, baseline blood count must show Absolute Neutrophil Count (ANC) >= 1500/microL and platelet count >= 100,000/microL.'
      }
    ]
  },
  {
    id: 'q-2',
    query: 'What are the remote work core hours and company values at NexusRAG?',
    response: 'According to the [employee_handbook_2026.md](doc-handbook) in the **Company Knowledge** base, NexusRAG is a remote-first company with the following values and hours guidelines:\n\n### Core Values:\n1. **Radical Transparency:** Sharing draft work early, default to public channels, and document design decisions.\n2. **First-Principles Thinking:** Deconstructing problems to their core truths rather than blindly following convention.\n3. **Extreme Ownership:** Owning projects end-to-end and taking full responsibility for results.\n\n### Core Collaboration Hours:\n- Core window is **10:00 AM to 3:00 PM EST**, during which employees are encouraged to be available for synchronous huddles and response times.',
    latencyMs: 1450,
    accuracy: 97.8,
    timestamp: '2026-06-11T03:30:00Z',
    kbName: 'Company Knowledge',
    tokensUsed: 890,
    feedback: 'positive',
    steps: [
      {
        agent: 'Orchestrator Planner',
        action: 'Plan Generation',
        status: 'completed',
        durationMs: 150,
        logs: ['Identified company HR/workplace rules search.', 'Formulated query: ["remote hours", "core values"]']
      },
      {
        agent: 'Knowledge Retriever',
        action: 'Document Fetch',
        status: 'completed',
        durationMs: 300,
        logs: ['Searched "Company Knowledge" collection.', 'Found match in "employee_handbook_2026.md" with similarity score 0.941.']
      },
      {
        agent: 'Synthesis Writer',
        action: 'Synthesis',
        status: 'completed',
        durationMs: 1000,
        logs: ['Formatted markdown list for values and core hours.']
      }
    ],
    sources: [
      {
        title: 'employee_handbook_2026.md',
        chunkId: 'doc-handbook#chunk-2',
        score: 0.941,
        snippet: 'Core collaboration window is 10:00 AM to 3:00 PM EST. Our core values include Radical Transparency, First-Principles Thinking, and Extreme Ownership.'
      }
    ]
  }
];

// LocalStorage Persistence Helpers for Client Side
const KB_KEY = 'nexusrag_kbs';
const DOCS_KEY = 'nexusrag_docs';
const QUERIES_KEY = 'nexusrag_queries';

export function getStoredKBs(): KnowledgeBase[] {
  if (typeof window === 'undefined') return INITIAL_KNOWLEDGE_BASES;
  const stored = localStorage.getItem(KB_KEY);
  if (!stored) {
    localStorage.setItem(KB_KEY, JSON.stringify(INITIAL_KNOWLEDGE_BASES));
    return INITIAL_KNOWLEDGE_BASES;
  }
  return JSON.parse(stored);
}

export function saveKBs(kbs: KnowledgeBase[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KB_KEY, JSON.stringify(kbs));
  }
}

export function getStoredDocs(): Document[] {
  if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
  const stored = localStorage.getItem(DOCS_KEY);
  if (!stored) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  return JSON.parse(stored);
}

export function saveDocs(docs: Document[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }
}

export function getStoredQueries(): QueryLog[] {
  if (typeof window === 'undefined') return INITIAL_QUERIES;
  const stored = localStorage.getItem(QUERIES_KEY);
  if (!stored) {
    localStorage.setItem(QUERIES_KEY, JSON.stringify(INITIAL_QUERIES));
    return INITIAL_QUERIES;
  }
  return JSON.parse(stored);
}

export function saveQueries(queries: QueryLog[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUERIES_KEY, JSON.stringify(queries));
  }
}
