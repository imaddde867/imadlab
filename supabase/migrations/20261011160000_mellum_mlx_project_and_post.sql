-- Mellum2.1 MLX quantization: project case study plus the write-up as a post.
insert into public.projects (id, title, description, full_description, tech_tags, repo_url, image_url, featured, published)
values (
  'de4514f4-023d-43f7-8270-9b0b8723091f',
  'Mellum2.1 on Apple Silicon: Quantized Builds Measured Against BF16',
  'MLX builds of JetBrains'' Mellum2.1 coding model for 16 GB and 24 GB Macs, checked against BF16 on the full HumanEval+ and timed on an M4.',
  $mm$## The problem

[Mellum2.1-12B-A2.5B-Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking) is JetBrains' 12B mixture-of-experts coding model, with 2.5B parameters active per token. Its BF16 weights are 24.3 GB, too large for most laptops. I wanted builds that run on a 16 GB and a 24 GB Mac, with what each one loses against the original measured on real tasks.

## What I built

I converted the model with MLX, ran every candidate through the same evaluation, and released the two that earned it:

| Your Mac | Build | Weights |
| --- | --- | ---: |
| 16 GB | [NVFP4](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4) | 6.84 GB |
| 24 GB or more | [6-bit](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64) | 9.87 GB |

A copy of the 6-bit build is also on mlx-community. While testing tool use I found that MLX-LM 0.32.0 silently drops tool calls it cannot parse, keeping `finish_reason: "tool_calls"` with an empty list. The repository carries a tested patch; another contributor's fix is open upstream as [mlx-lm#1957](https://github.com/ml-explore/mlx-lm/pull/1957).

## Try it

```sh
pip install 'mlx-lm==0.32.0'
python -m mlx_lm generate --model imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4 \
  --prompt 'Find the bug: def mean(xs): return sum(xs) / len(xs) - 1' \
  --temp 0.6 --top-p 0.95 --top-k 20 --max-tokens 16384
```

Always set `--max-tokens`: reasoning and the answer share the budget, and the MLX-LM server defaults to 512 tokens.

## How it was measured

Each build ran the full 164-task HumanEval+ on a CUDA GPU with the upstream chat template, greedy decoding, one sample per task and an 8,192-token budget that includes the model's reasoning. Speed and memory were measured on a 14-inch MacBook Pro with an M4 and 16 GB. Each build was timed in the same session as MXFP4, and NVFP4 was interleaved with it run by run. Every experiment that could change what I shipped had its decision rule written down before it ran. Conversion, generation and evaluation each write a receipt with the source revision, package versions and SHA-256 checksums.

## Results

| Build | Weights | HumanEval+ | Budget hits | Median tokens | M4 decode tok/s, 1K / 16K |
| --- | ---: | ---: | ---: | ---: | ---: |
| BF16 original | 24.3 GB | 153 (93.3%) | 3 | 1,571 | n/a |
| NVFP4 (released) | 6.84 GB | 145 (88.4%) | 6 | 1,674 | 63.9 / 55.8 |
| 6-bit (released) | 9.87 GB | 146 (89.0%) | 3 | 1,521 | 47.2 / 42.8 |
| MXFP4 (randmaru) | 6.46 GB | 144 (87.8%) | 6 | 1,544 | 66.7 / 57.4 |
| Affine 4-bit (not released) | 6.84 GB | 133 (81.1%) | 18 | 3,242 | n/a |

Long context runs on the 16 GB M4: NVFP4 peaks at 8.33 GB at 64K and 9.40 GB at 128K, decoding at 39.6 and 29.0 tok/s, though a 128K prompt takes about 9 minutes to read in and swap grew from 2.8 to 5.0 GB across the two runs.

The finding I did not expect: affine 4-bit wrote completions 2.2 times as long as BF16 on the same tasks (Wilcoxon p = 5×10⁻²⁵) and ran out of budget mid-reasoning on 18 of them. MXFP4 is smaller and kept BF16's length. A pass@1 table hides this, so the write-up [Quantization format and reasoning length in Mellum2.1](/blogs/quantization-format-and-reasoning-length-in-mellum2-1) covers it in detail.

Two other results shaped the release. NVFP4 measured about 30% closer to BF16 than MXFP4 by KL divergence and decoded at 95 to 96% of its speed, yet only tied it on HumanEval+ (145 vs 144, p = 1.0) and wrote 12% longer completions. Raising attention to 8-bit on top of MXFP4 cost 14 to 17% of decode speed with no measurable accuracy gain, because in a model this sparse, attention is about a quarter of the weights read for every token. Four attempts to beat MXFP4 (mixed 4/6-bit, group-32 experts, DWQ calibration, 8-bit attention) tied or lost under their pre-written rules, and all four are documented.

## Limits

One model, one benchmark, one greedy sample per task. HumanEval+ may overlap the training data, so these are regression results, not a general coding score. The KL comparison uses a small Python corpus of 32 trajectories. The M4 numbers come from a single machine. The quantization methods are upstream; my contribution is the conversion, measurement, integration and analysis.

## Links

- Repository with scripts, raw outputs, receipts and every failed experiment: [imaddde867/mellum-mlx](https://github.com/imaddde867/mellum-mlx)
- Models: [NVFP4](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4), [6-bit](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64), [mlx-community 6-bit](https://huggingface.co/mlx-community/Mellum2.1-12B-A2.5B-Thinking-6bit)
$mm$,
  array['quantization', 'mlx', 'llm-evaluation', 'apple-silicon', 'mixture-of-experts', 'local-llm'],
  'https://github.com/imaddde867/mellum-mlx',
  '/images/mellum-solved-by-budget.png',
  true,
  true
);

insert into public.posts (title, slug, body, excerpt, tags, published_date, read_time, image_url)
values (
  'Quantization format and reasoning length in Mellum2.1',
  'quantization-format-and-reasoning-length-in-mellum2-1',
  $mm$I quantized JetBrains' [Mellum2.1-12B-A2.5B-Thinking](https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking), a 12B mixture-of-experts coding model with 2.5B active parameters, for Apple Silicon with [MLX](https://github.com/ml-explore/mlx). I ran the full 164-task HumanEval+ on the BF16 original and three quantizations. Each run used the same prompts, greedy decoding, and an 8,192-token budget that includes the model's reasoning.

| | Weights | HumanEval+ | Hit the budget | Median completion tokens |
|---|---:|---:|---:|---:|
| BF16 original | 24.3 GB | 153 / 164 | 3 | 1,571 |
| MLX 6-bit (affine, g64) | 9.9 GB | 146 / 164 | 3 | 1,521 |
| MXFP4 (randmaru) | 6.5 GB | 144 / 164 | 6 | 1,544 |
| MLX 4-bit (affine, g64) | 6.8 GB | 133 / 164 | 18 | 3,242 |

Both 4-bit builds fit on a 16 GB Mac. One loses 9 tasks to BF16 and the other loses 20, and on a pass@1 table that gap looks like ordinary quantization damage. The completion lengths show something else.

![HumanEval+ tasks solved within a token budget](/images/mellum-solved-by-budget.svg)

## The 4-bit model second-guesses itself

On the 144 tasks where both runs finished, the affine 4-bit model's completions were **2.2× longer than BF16's** (paired geometric mean; Wilcoxon p ≈ 5×10⁻²⁵). The 6-bit and MXFP4 runs stayed within a few percent of BF16 (1.04× and 0.98×, neither significant).

Most of the extra tokens are hesitation. The word "But" shows up 22 times per reasoning trace on 4-bit, against 8 or 9 for every other build, and "Actually" 3.9 times against 1.4 to 2.2. All 18 budget truncations ran out mid-reasoning, before any code was written.

Cap the budget at 2,048 tokens and the scores look very different. BF16 solves 120 tasks, 6-bit 108, MXFP4 109, and affine 4-bit **21**.

## Why length matters on a laptop

Every token costs time. At 50 to 65 tokens/s on an M4, an extra 1,700 tokens adds roughly half a minute to every answer. A quantization can keep its score under a generous budget and still be much worse to use. If you quantize a reasoning model, report completion length or pass@budget next to accuracy.

## What helped and what didn't

The expert format mattered most. MXFP4 stores each block of 32 weights as 4-bit floats with one shared 8-bit exponent. It comes out *smaller* than affine 4-bit with group 64 (6.5 vs 6.8 GB) and keeps BF16's reasoning length. Most of this model's weights sit in its 64 experts.

Attention precision only helped when the experts were already damaged. At 6-bit on top of affine 4-bit experts, it recovered most of the loss on a 24-task screen and drew level with MXFP4 (22 vs 21 tasks), while being 10% larger and 24% slower to generate. At 8-bit on top of MXFP4 experts, it bought nothing: 145/164 against 144 (p = 1.0), and 14 to 17% slower decoding on the M4. In a 2.5B-active MoE, attention is about a quarter of the weights read for every token, so its extra bits cost speed on every token. I had written the ship rule down before that run, and it failed the speed gate.

A bounded DWQ calibration run on scales and biases made held-out loss worse and moved task results by no more than noise.

## What I shipped

The [6-bit](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-6bit-g64) (146/164, 9.9 GB) solves the most tasks, but MXFP4 ties it and decodes 41% faster on the M4. So for 16 GB Macs I tried one more format. [NVFP4](https://huggingface.co/imaadd05/Mellum2.1-12B-A2.5B-Thinking-mlx-nvfp4) uses groups of 16 weights with FP8 scales. It measured about 30% closer to BF16 than MXFP4 by KL divergence, on held-out reasoning, answer and tool-call traces, and decoded at 95 to 96% of MXFP4's speed. It tied MXFP4 on HumanEval+ (145 vs 144). It's my pick for 16 GB when fidelity matters. MXFP4 still gives the fastest finished answers.

## Open questions and limits

I expected NVFP4 to settle the length question. It's measurably closer to BF16 than MXFP4, so it should think more like BF16. Instead it writes completions 1.09× as long as BF16's (Wilcoxon p = 0.0005), while MXFP4, which is further from BF16, stays at 0.98×. So distance from the original distribution doesn't predict how long this model deliberates. I don't know which part of the rounding pushes a model toward the extra "But"s.

The evidence also has limits:

- One model, one benchmark, one greedy sample per task. HumanEval+ may overlap the training data, so treat these as regression results, not a general coding score.
- The KL comparison uses a small Python corpus of 32 trajectories.
- Raw responses, per-task outcomes, the scripts and every failed experiment are in [the repository](https://github.com/imaddde867/mellum-mlx). `python scripts/length_audit.py results/coding/humaneval-plus` reproduces the statistics.

The released builds, the full results table and how they were measured are on the [project page](/projects/de4514f4-023d-43f7-8270-9b0b8723091f).
$mm$,
  'Affine 4-bit and MXFP4 builds of a 12B coding model differ by 0.3 GB. On HumanEval+ one wrote completions 2.2 times as long as BF16 and ran out of budget mid-reasoning on 18 tasks.',
  array['quantization', 'mlx', 'llm-evaluation', 'local-llm'],
  '2026-10-11',
  4,
  '/images/mellum-solved-by-budget.png'
);
