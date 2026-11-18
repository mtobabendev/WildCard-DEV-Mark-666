# Performance profiles and media candidates

- Auto: Fire TV / AFT devices use Lightweight; Linux ARM devices and reported memory up to 4 GB use Balanced, unless an earlier rule selects Lightweight. Unknown devices retain Cinematic. Device signals are hints, not definitive hardware benchmarks.
- Manual preference is stored locally per origin. The `?performance=balanced` (or `lightweight`, `cinematic`, `auto`) query can preview a mode; the header selector persists the preference and reloads the page.
- Balanced and Lightweight skip the introductory movie, stop idle main-spinner RAF and mount only the selected spinner video, disable selected decorative effects, and detach offscreen decorative media. Cinematic retains the existing behavior. Native user-controlled media is unchanged.
- Two homepage identity clips have preview alternatives: full-resolution Main-profile H.264 for Balanced, smaller H.264 for Lightweight. Original WebM stays in Cinematic and is the fallback if H.264 cannot play. Posters are shown in constrained mode. Other clips are unchanged.
- This is not a global simultaneous decoder cap. Other visible decorative panels can still play concurrently. Hardware decoding and actual CPU/RAM improvement must be measured on the target devices.

## Reusable candidate pipeline

Requires FFmpeg and FFprobe. Run from the repository:
```
node scripts/optimize-media.mjs INPUT OUTPUT_DIRECTORY balanced --silent
node scripts/optimize-media.mjs INPUT OUTPUT_DIRECTORY lightweight --silent
```
Use original masters, never overwrite files. Omit `--silent` for audio that must be retained. Set FFMPEG_PATH and FFPROBE_PATH if the executables are not on PATH. The script emits a candidate MP4, WebP poster, size, dimensions, duration and SSIM at candidate resolution. It is not a production asset replacement script.

## Candidate measurements (bytes)

| Clip | Existing WebM | Balanced H.264 | Lightweight H.264 |
| --- | ---: | ---: | ---: |
| WitchPennyAndKandy2 | 1086822 | 1084705 | 958325 |
| KandyKandle | 1719502 | 1462188 | 1054293 |

Full-resolution SSIM versus the corresponding master, after frame-rate alignment: existing WebMs 0.966395 / 0.954504; Balanced candidates 0.973553 / 0.966931. At lightweight resolution, candidates 0.972855 / 0.967613. These are objective comparisons, not a claim of mathematically lossless or perceptually identical playback. Visual and hardware review required before release.

Preserve original masters and WebM assets. No production rollout until Owner Gate.
