-- IPKE thesis case study: replaces overclaiming text ("gold labels", mislabeled 70B row) with a verified, qualitative write-up.
update public.projects
set title = 'IPKE: Auditable Procedure Graphs from Industrial Documents with Local LLMs',
    description = 'My completed bachelor''s thesis: a local, privacy-preserving LLM pipeline that turns industrial procedures into auditable knowledge graphs, evaluated on constraint coverage.',
    tech_tags = array['local-llm', 'knowledge-graphs', 'information-extraction', 'llm-evaluation', 'privacy-by-design', 'llama-cpp', 'python'],
    full_description = $ipke$## The problem

Ask a language model to summarize a maintenance procedure and you get a clean paragraph. It usually keeps the intent and drops the sentence that matters, such as the lockout check before a valve is touched or the pressure threshold before venting. A summary can read well and still be operationally wrong, because the risk in a procedure sits in its conditions and exceptions.

IPKE (Industrial Procedural Knowledge Extraction) treats this as structured prediction instead of text compression. The output is a procedural knowledge graph: ordered steps, typed constraints, decision points, and explicit edges that say which constraint governs which step. An orphaned warning or a missing guard shows up in the graph, where an engineer reviewing it can see it.

## Constraints

Industrial procedures cannot be sent to a hosted API, so every model runs locally. The default is a 4-bit quantized 7B model (Mistral-7B-Instruct, GGUF, Q4_K_M) on llama.cpp with Metal and CUDA backends, sized for a 16 GB machine. Every output also has to pass schema validation and stay open to human correction, since a plausible graph with a wrong edge is worse than an obviously broken one.

## My role

This was my bachelor's thesis at Turku University of Applied Sciences, completed in 2026. I wrote the pipeline, the evaluation code and the annotations. The thesis is public on Theseus: https://www.theseus.fi/handle/10024/907018.

## Architecture

```mermaid
flowchart LR
  A["PDF / DOCX / TXT"] --> B["Normalize"]
  B --> C["Dual Semantic Chunking"]
  C --> D["Stage 1: step skeleton"]
  D --> E["Stage 2: constraints with step IDs"]
  E --> F["Schema + constraint validation"]
  F --> G["Procedural graph"]
  G --> H["Streamlit review / Neo4j / FastAPI"]
```

Dual Semantic Chunking (DSC) segments a document with a dynamic-programming objective: sentence-embedding cohesion inside each segment, a penalty per segment, and a small bonus for splitting at a heading. The goal is to keep a warning and the step it governs in the same context window, which matters with small-context local models.

Two-stage decomposition (P3) splits the extraction. Stage 1 extracts only the ordered steps. Stage 2 gets the source plus those step IDs and extracts constraints, each of which must reference a step. When I asked a 7B model to handle order, scope and relations in one pass, the output was fragile; splitting the task lowered the load per call. I suspect it also reduces instruction drift, but I haven't tested that directly.

A post-hoc validator canonicalizes step IDs and repairs or drops constraint links that point at steps that don't exist, so the final graph is well formed even when the raw model output is noisy. A Streamlit view highlights orphaned constraints so a reviewer can reattach, merge or delete them.

## Evaluation design

Overlap metrics reward the easy parts of a procedure, so IPKE reports several measures separately:

- Step F1: steps matched one-to-one (Hungarian alignment on SBERT cosine similarity, accepted above a threshold).
- Adjacency and ordering: whether transitions and step order survive.
- Constraint coverage: the share of reference constraints recovered, matched semantically rather than by exact string.
- Constraint attachment: whether a recovered constraint is bound to the right step. A guard attached to the wrong step counts as a structural error.
- Procedural Fidelity: a composite that weights constraint coverage most heavily. I chose the weights myself and have not validated them.

## Results and limits

On a small document set, two-stage extraction recovered far more constraints than single-pass prompting. On one document, a local 7B model with two-stage prompting scored above a 70B model prompted the standard way. The full tables are in the thesis. I leave the figures out here because the raw result files for those runs were never committed, so I can't re-derive them today.

The evaluation has real gaps. It used three English documents and one annotator, with no inter-annotator agreement and no external published baseline. The 70B comparison is a single run on a single document, and part of the 70B failure was output formatting (Markdown-wrapped JSON, conversational preambles) that my parser didn't tolerate, so it says little about model capability. The attachment metric used strict string matching and often returned zero, which means attachment, the central claim, was only weakly measured. What I say about review time comes from my own use of the tool, not a user study. One question is still open: the thesis reports chunker results that disagree with each other (DSC is called the best chunker while scoring the lowest Step F1), so I don't know yet whether DSC helps.

After the thesis I relabeled the repository's annotated files as development candidates rather than human-verified reference data, and added checks that refuse unverified annotations as evidence.

## What I would do differently

1. Build the reference annotations with independent reviewers first, with a second annotator on a subset, before comparing any method.
2. Use a semantic attachment metric from the start and report confidence intervals over several seeds.
3. Run the model comparison across all documents with a parser tolerant of formatting noise.
4. Keep result files in version control so every reported number resolves to a file.
5. Give each constraint a severity label so the score weights a missed lockout above a missed tip.
$ipke$,
    updated_at = now()
where title = 'IPKE: Procedural Knowledge Graph Extraction from Industrial Documentation';
