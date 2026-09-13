-- Follow-up to 20260913120000: makes the FL-Attack page's notation readable
-- without restating any result. Expands PSNR, SSIM and LPIPS once where the
-- first metrics table uses them, states what LabelMatch counts, adds the DP
-- sweep's clipping norm and delta (both read from run_defenses.sh and the
-- run_experiment.py defaults), and adds a References section. Every arXiv id
-- below was resolved against arxiv.org before this migration was written.
update public.projects
set
  full_description = $fd$Federated learning is sold on a simple promise: your data stays on your device, only gradients leave it. This repo tests what that promise is worth. It trains a small CNN across simulated clients on CelebA, captures one client's gradient update from a single round, and runs a DLG/iDLG-style optimization attack against it ([Zhu et al. 2019](https://arxiv.org/abs/1906.08935), [Zhao et al. 2020](https://arxiv.org/abs/2001.02610)). The reconstruction comes back at 29.38 dB PSNR and 0.920 SSIM, which is a recognizable photograph of a person who never uploaded a photograph.

That result is well established in the literature and it reproduces cleanly here. The more interesting half of this project is what happened when I benchmarked defenses against the attack. Two of the six rows in my own results table measure something other than what their labels say, and working that out took longer than building the attack did.

Live dashboard: https://imaddde867.github.io/FL-Attack/

## What the attacker actually sees

Every number on this page comes from `attack_source="gradients"`. The attacker holds one client's raw gradient tensor for one batch, captured before aggregation and before any server-side mixing. That is the weakest possible position for the defender and the strongest for the attacker, which makes it the right place to start and the wrong place to draw conclusions about a production deployment. The pipeline can capture a one-step update instead of the raw gradient, and it can capture the aggregated update rather than a single client's, but nothing on this page uses either mode. That becomes the point later.

It matters for reading the defense numbers later. Local differential privacy (clip the client's release, add calibrated Gaussian noise before it goes out) is the mechanism that belongs at this exact release point, so evaluating it here is fair. Every DP run below clips to an L2 norm of 1.0 and calibrates its noise at δ=1e-5. Secure aggregation is not, because there is no aggregate yet.

![Reconstructions from six different clients, original and recovered side by side](https://raw.githubusercontent.com/imaddde867/FL-Attack/main/docs/assets/montages/top_ranked.png)

## Setup

Source: `fl_system.py`, `results/showcase/config.json`, `scripts/run_showcase.sh`.

| Item | Value |
|---|---|
| Dataset | CelebA ([Liu et al. 2015](https://arxiv.org/abs/1411.7766)), expected in `data/`, not committed |
| Task | Binary attribute classification (`target_attr="Male"`) |
| Input | 64x64 RGB, normalize mean/std = (0.5, 0.5, 0.5) |
| Clients | 10 total, 50% sampled per FL round |
| Subset used (showcase/defenses) | 200 train images, 40 validation images |
| Global model | SimpleCNN (LeNet-style), 8,760,962 parameters |
| Client optimizer | SGD, lr=0.01 (momentum varies by run) |
| FL config (showcase) | 1 round, 1 local epoch, batch_size=1, seed=42 |
| Attack config (showcase) | Adam lr=0.1, iterations=4500, restarts=5, TV=1e-5, match_metric=l2 |

## One lucky victim, or all of them

I ran the undefended attack once per client across all ten clients, same config each time. PSNR is peak signal-to-noise ratio in dB and SSIM is structural similarity, both higher for a closer reconstruction. LPIPS is a learned perceptual distance ([Zhang et al. 2018](https://arxiv.org/abs/1801.03924)), so lower means the reconstruction reads as more similar to a human eye.

| Metric | Mean | Std | Min | Max |
|---|---:|---:|---:|---:|
| PSNR (dB) | 27.29 | 1.21 | 24.91 | 29.51 |
| SSIM | 0.923 | 0.025 | 0.863 | 0.950 |
| LPIPS | 0.125 | 0.029 | 0.082 | 0.193 |

The 29.38 dB headline figure sits near the top of that spread. The floor is 24.91 dB, on the worst of the ten, which is still a face.

![Metric distributions across ten single-client baseline runs](https://raw.githubusercontent.com/imaddde867/FL-Attack/main/docs/assets/charts/multiclient_boxplots.png)

## Defenses, with the row labels corrected

If you screenshot one table from this page, make it this one, and read the note under it.

| Setting | PSNR (dB) | SSIM | LPIPS (lower is better) | LabelMatch |
|---|---:|---:|---:|---:|
| Baseline, no defense | 29.38 | 0.920 | 0.117 | 100% |
| DP, ε=8.0 | 6.71 | -0.001 | 0.807 | 0% |
| DP, ε=1.0 | 6.32 | -0.001 | 0.747 | 0% |
| DP, ε=0.1 | 6.36 | -0.001 | 0.806 | 0% |
| "HE" prototype (no encryption executed) | 14.03 | 0.343 | 0.635 | 100% |
| DP + "HE" prototype | 6.37 | -0.003 | 0.824 | 0% |

LabelMatch is the share of attacked examples whose class label the attack also recovered, and every run here reads a single example, so it lands on 0% or 100%. Two things to carry away from that table before you quote it anywhere. The three DP rows are a real local-DP mechanism, but they sit on top of each other because the epsilon values I picked cannot separate at this model size, for reasons the next section works out. The HE rows describe a quantizer with additive noise and say nothing about homomorphic encryption or secure aggregation. Anyone reading 14.03 dB as "encryption gives you partial protection" has been misled by my own labeling, which is why the labels now carry the qualifier.

![Defense mechanisms compared by PSNR, SSIM, and LPIPS, with LabelMatch overlaid](https://raw.githubusercontent.com/imaddde867/FL-Attack/main/docs/assets/charts/defenses_grouped_bars.png)

The chart's x-axis carries the raw run slugs (`dp_he`, `he`), with no qualifier, so read it through the corrected table above rather than on its own. One thing worth naming here: LabelMatch drops to 0% on every DP row but sits at 100% on the `he` row. Quantization keeps enough gradient structure that label inference still works; the DP mechanism's Gaussian noise destroys that structure along with everything else. That is not a partial win for the "HE" prototype. It is a measurement of what quantization alone does to attack success, not of what a real encryption layer would do.

## Why the three epsilon rows land on top of each other

Per-coordinate Gaussian DP noise has an L2 norm that scales like σ√d, and d here is 8,760,962 parameters. At the loosest setting I tested, ε=8, the injected noise already carries roughly 1800 times the L2 norm of the clipped gradient it is meant to hide. Tightening to ε=1 and then ε=0.1 scales up a quantity that had already buried the signal several orders of magnitude earlier. A flat column is what that arithmetic predicts.

![Injected DP noise L2 norm against clipped signal bound, by model dimensionality](https://raw.githubusercontent.com/imaddde867/FL-Attack/main/docs/assets/figures/dp_noise_scaling.png)

`scripts/dp_noise_scaling_proof.py` works the scaling out across model sizes and produces that figure. The 8.76M-parameter mark sits deep in the region where the noise dominates, and it gets there well before ε=8.

I would rather have had a clean graded curve, because a graded curve is a more interesting plot. Getting one at this release point would have meant testing epsilons far looser than 8, or running the whole thing on a much smaller model where the √d penalty is survivable.

## The HE row does not test encryption

`homomorphic_encryptor.py` quantizes the gradient and adds fixed-scale Laplace noise. For a tensor of this size it takes the fast simulation path and never executes Paillier encryption at all. On the path where encryption does run, the pipeline decrypts the result before scoring it, so the attacker is handed the plaintext back regardless. A real secure-aggregation deployment never exposes that decrypted intermediate to anyone, least of all to the party running this attack.

The numbers in that row are therefore a measurement of quantization plus Laplace noise, sitting in a column heading that promises something else. Nothing about the implementation is broken. It was built as a prototype, and it is now labeled as one everywhere the numbers appear.

## What this benchmark does not measure

It scores attack quality and nothing else. There is no model accuracy figure under any defense, so none of this speaks to the privacy and utility tradeoff. A defense that drops reconstruction to 6.3 dB might also make the classifier worthless, and this pipeline would not notice.

The experiment I actually want is still unrun. The pieces are already in the codebase: `capture_mode='agg_update'` captures the update averaged by FedAvg ([McMahan et al. 2017](https://arxiv.org/abs/1602.05629)) instead of a single client's gradient, and `differential_privacy.aggregate_clipped_noisy` applies central DP at that point. Run together, they model what a curious aggregator sees under real secure aggregation, which is the threat model people have in mind when they say "we use HE." No GPU or CelebA compute was available this cycle, so that row stays empty rather than filled with a guess.

## Reproduce it

Prereq: download CelebA and place it under `data/` as expected by `fl_system.py`.

```bash
pip install -r requirements.txt
bash scripts/run_showcase.sh
python scripts/make_dashboard.py && python -m http.server --directory docs 8000
```

Every run writes its own `config.json` and `metrics.txt` beside its reconstruction image, so a batch of experiments is a directory you can walk. `scripts/analyze_*.py` roll those up into `results/report/summary.csv`, and `scripts/make_dashboard.py` collapses everything into `results/report/dashboard/data.json`, the single file the charts and the run browser both read from. `device_utils.py` picks CPU, CUDA, or MPS at runtime, which is the only reason this was developable on a laptop at all.

Full architecture diagram (10425px wide, open it in its own tab): https://raw.githubusercontent.com/imaddde867/FL-Attack/main/architecture_mermaid.png

## References

- Zhu, Liu and Han. Deep Leakage from Gradients. NeurIPS 2019. [arXiv:1906.08935](https://arxiv.org/abs/1906.08935)
- Zhao, Mopuri and Bilen. iDLG: Improved Deep Leakage from Gradients. 2020. [arXiv:2001.02610](https://arxiv.org/abs/2001.02610)
- Geiping, Bauermeister, Dröge and Moeller. Inverting Gradients: How Easy Is It to Break Privacy in Federated Learning? NeurIPS 2020. [arXiv:2003.14053](https://arxiv.org/abs/2003.14053). Source of the `sim` matching loss in the attack's ablation.
- Zhang, Isola, Efros, Shechtman and Wang. The Unreasonable Effectiveness of Deep Features as a Perceptual Metric. CVPR 2018. [arXiv:1801.03924](https://arxiv.org/abs/1801.03924). Defines LPIPS.
- McMahan, Moore, Ramage, Hampson and Agüera y Arcas. Communication-Efficient Learning of Deep Networks from Decentralized Data. AISTATS 2017. [arXiv:1602.05629](https://arxiv.org/abs/1602.05629). Defines FedAvg.
- Liu, Luo, Wang and Tang. Deep Learning Face Attributes in the Wild. ICCV 2015. [arXiv:1411.7766](https://arxiv.org/abs/1411.7766). Source of CelebA.
$fd$,
  updated_at = now()
where id = '6dd91268-b428-4803-9100-904bf51b895f';
