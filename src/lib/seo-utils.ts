const TITLE_MAP: Record<string, string> = {
  Explainium: 'Explainium: Local LLM Procedural Knowledge Extraction',
  InfiniteChessAI: 'InfiniteChessAI: Self-Improving Chess Engine in SwiftUI',
  'Spiral Untangler ANN': 'Neural Network for Nonlinear Classification (NumPy)',
};

export const getSeoTitle = (projectTitle: string) => {
  const trimmed = projectTitle?.trim();
  if (!trimmed) {
    return projectTitle;
  }

  return TITLE_MAP[trimmed] ?? trimmed;
};
