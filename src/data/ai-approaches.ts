export interface ExternalSource {
  id: string;
  citation: string;
  url: string;
}

export const EXTERNAL_SOURCES: readonly ExternalSource[] = [
  {
    id: 'vaswani-2017',
    citation: 'Vaswani et al., "Attention Is All You Need", NeurIPS 2017.',
    url: 'https://arxiv.org/abs/1706.03762',
  },
  {
    id: 'brown-2020',
    citation: 'Brown et al., "Language Models are Few-Shot Learners", NeurIPS 2020.',
    url: 'https://arxiv.org/abs/2005.14165',
  },
  {
    id: 'lewis-2020',
    citation: 'Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", NeurIPS 2020.',
    url: 'https://arxiv.org/abs/2005.11401',
  },
  {
    id: 'schick-2023',
    citation: 'Schick et al., "Toolformer: Language Models Can Teach Themselves to Use Tools", NeurIPS 2023.',
    url: 'https://arxiv.org/abs/2302.04761',
  },
  {
    id: 'yao-2023',
    citation: 'Yao et al., "ReAct: Synergizing Reasoning and Acting in Language Models", ICLR 2023.',
    url: 'https://arxiv.org/abs/2210.03629',
  },
  {
    id: 'wei-2022',
    citation: 'Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", NeurIPS 2022.',
    url: 'https://arxiv.org/abs/2201.11903',
  },
  {
    id: 'deepseek-2025',
    citation: 'DeepSeek-AI, "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning", Nature, 2025.',
    url: 'https://arxiv.org/abs/2501.12948',
  },
  {
    id: 'hogan-2021',
    citation: 'Hogan et al., "Knowledge Graphs", ACM Computing Surveys, 2021.',
    url: 'https://arxiv.org/abs/2003.02320',
  },
  {
    id: 'garcez-2023',
    citation: 'd\'Avila Garcez and Lamb, "Neurosymbolic AI: The 3rd Wave", Artificial Intelligence Review, 2023.',
    url: 'https://arxiv.org/abs/2012.05876',
  },
  {
    id: 'ji-2023',
    citation: 'Ji et al., "Survey of Hallucination in Natural Language Generation", ACM Computing Surveys, 2023.',
    url: 'https://arxiv.org/abs/2202.03629',
  },
  {
    id: 'kadavath-2022',
    citation: 'Kadavath et al., "Language Models (Mostly) Know What They Know", arXiv preprint, 2022.',
    url: 'https://arxiv.org/abs/2207.05221',
  },
  {
    id: 'kirkpatrick-2017',
    citation: 'Kirkpatrick et al., "Overcoming catastrophic forgetting in neural networks", PNAS, 2017.',
    url: 'https://arxiv.org/abs/1612.00796',
  },
  {
    id: 'ouyang-2022',
    citation: 'Ouyang et al., "Training language models to follow instructions with human feedback", NeurIPS 2022.',
    url: 'https://arxiv.org/abs/2203.02155',
  },
  {
    id: 'bai-2022',
    citation: 'Bai et al., "Constitutional AI: Harmlessness from AI Feedback", arXiv preprint, 2022.',
    url: 'https://arxiv.org/abs/2212.08073',
  },
  {
    id: 'liang-2023',
    citation: 'Liang et al., "Holistic Evaluation of Language Models", Transactions on Machine Learning Research, 2023.',
    url: 'https://arxiv.org/abs/2211.09110',
  },
  {
    id: 'nist-2023',
    citation: 'National Institute of Standards and Technology, "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", 2023.',
    url: 'https://doi.org/10.6028/NIST.AI.100-1',
  },
];

export interface ApproachComparisonRow {
  topic: string;
  typicalMainstream: string;
  alsoFoundInMainstream: string;
  byteliteToday: string;
  byteliteIntended: string;
  sourceIds: readonly string[];
}

export const APPROACH_COMPARISON: readonly ApproachComparisonRow[] = [
  {
    topic: 'Core method',
    typicalMainstream:
      'Large neural networks trained on very large text collections generate a response one token at a time.',
    alsoFoundInMainstream:
      'Many products combine the model with search, databases, code execution and other tools.',
    byteliteToday:
      'No generative language model is used. Replies come from governed knowledge records, from structured information supplied with the request, or from fixed conversation templates, all through one governed processing path.',
    byteliteIntended:
      'Responses built from explicitly represented concepts and their relationships.',
    sourceIds: ['vaswani-2017', 'brown-2020'],
  },
  {
    topic: 'Breadth of capability',
    typicalMainstream:
      'Broad, general-purpose language ability across writing, translation, coding, summarisation and question answering, used by very large numbers of people.',
    alsoFoundInMainstream: 'Image, audio and video input and output in many current systems.',
    byteliteToday:
      'Narrow. A research system with limited knowledge coverage that is not available to the public.',
    byteliteIntended: 'Broader coverage, added only as fast as it can be governed and verified.',
    sourceIds: ['brown-2020'],
  },
  {
    topic: 'Knowledge representation',
    typicalMainstream: 'Most knowledge is held implicitly in the model\'s learned parameters.',
    alsoFoundInMainstream:
      'Knowledge graphs, databases and retrieval systems supply explicit knowledge alongside the model.',
    byteliteToday:
      'Knowledge is held as explicit records that carry where they came from.',
    byteliteIntended:
      'Connected concepts and relationships as the primary foundation of the system, not an add-on.',
    sourceIds: ['hogan-2021', 'garcez-2023'],
  },
  {
    topic: 'Reasoning',
    typicalMainstream:
      'Multi-step reasoning emerges from the model and is strengthened with prompting and with training methods such as reinforcement learning.',
    alsoFoundInMainstream:
      'Reasoning interleaved with tool calls, external checkers and symbolic components.',
    byteliteToday:
      'Limited. The parts that would let the system reason over a request\'s structure are early, not verified and not connected to answers.',
    byteliteIntended:
      'Reasoning over explicit relationships, with each step traceable to established knowledge.',
    sourceIds: ['wei-2022', 'yao-2023', 'deepseek-2025'],
  },
  {
    topic: 'Retrieval and tool use',
    typicalMainstream:
      'Retrieval-augmented generation and tool calling are widely used to add current or specialised information.',
    alsoFoundInMainstream: 'Models that learn when and how to call external tools.',
    byteliteToday: 'The system uses its own governed knowledge records and information supplied with the request. It does not search the web or call outside tools.',
    byteliteIntended:
      'Requests for information from other specialised systems, such as visual or audio systems, through defined interfaces.',
    sourceIds: ['lewis-2020', 'schick-2023'],
  },
  {
    topic: 'Provenance',
    typicalMainstream:
      'A model on its own generally cannot identify which training data produced a given statement.',
    alsoFoundInMainstream: 'Retrieval systems can cite the documents they retrieved.',
    byteliteToday: 'Every knowledge record carries a record of its stated source. How sources are trusted is still being decided.',
    byteliteIntended: 'Every answer traceable to the exact records and knowledge generation it used.',
    sourceIds: ['lewis-2020'],
  },
  {
    topic: 'Uncertainty',
    typicalMainstream:
      'Models can produce fluent statements that are wrong, an effect widely studied as hallucination.',
    alsoFoundInMainstream:
      'Research shows models can often estimate their own confidence, and products add citation and verification steps.',
    byteliteToday:
      'In tested cases, the system says plainly when it does not know about a concept.',
    byteliteIntended:
      'A precise account of which knowledge a task requires and which of it is missing.',
    sourceIds: ['ji-2023', 'kadavath-2022'],
  },
  {
    topic: 'Determinism',
    typicalMainstream:
      'Output is commonly sampled, so the same prompt can produce different responses.',
    alsoFoundInMainstream:
      'Lower-randomness settings, and deterministic tools called by the model, are widely available.',
    byteliteToday:
      'The same request against the same knowledge produces the same response in internal tests on one machine.',
    byteliteIntended: 'Determinism as a property that outside reviewers can confirm.',
    sourceIds: [],
  },
  {
    topic: 'Learning over time',
    typicalMainstream:
      'Learned parameters are fixed after training. Updating them requires further training, and continual learning is a known open problem.',
    alsoFoundInMainstream: 'Memory features that store information outside the model.',
    byteliteToday:
      'Knowledge changes only through explicit operator steps. The system does not learn from conversations.',
    byteliteIntended: 'Continuing knowledge acquisition under governance, with provenance kept for every addition.',
    sourceIds: ['kirkpatrick-2017'],
  },
  {
    topic: 'Governance',
    typicalMainstream:
      'Behaviour is shaped by training with human or AI feedback, plus policy filters around the model.',
    alsoFoundInMainstream: 'Organisational risk-management frameworks applied to the whole system.',
    byteliteToday:
      'Parts of a governed processing path exist and pass internal tests. Complete governance has not been demonstrated, so public use stays disabled.',
    byteliteIntended:
      'Governance that is explicit, inspectable and independently verified before any public use.',
    sourceIds: ['ouyang-2022', 'bai-2022', 'nist-2023'],
  },
  {
    topic: 'Verification',
    typicalMainstream:
      'Systems are evaluated on broad public benchmarks and in third-party evaluations.',
    alsoFoundInMainstream: 'Holistic evaluation suites that measure many properties at once.',
    byteliteToday: 'Internal automated tests only. No independent evaluation has taken place.',
    byteliteIntended: 'Independent evaluation against published criteria before any capability claim.',
    sourceIds: ['liang-2023'],
  },
];

export function sourcesFor(sourceIds: readonly string[]): readonly ExternalSource[] {
  return sourceIds.map((sourceId) => {
    const source = EXTERNAL_SOURCES.find((candidate) => candidate.id === sourceId);
    if (!source) throw new Error(`Unknown source: ${sourceId}`);
    return source;
  });
}
