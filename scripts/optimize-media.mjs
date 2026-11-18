import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';

const [inputArg, outputArg, preset = 'balanced', ...options] = process.argv.slice(2);
const presets = {
  cinematic: { short: 1080, long: 1920, fps: 30, crf: 20, profile: 'high' },
  balanced: { short: 540, long: 960, fps: 24, crf: 26, profile: 'main' },
  lightweight: { short: 360, long: 640, fps: 24, crf: 25, profile: 'main' },
};
if (!inputArg || !outputArg || !Object.hasOwn(presets, preset) || options.some(v => v !== '--silent')) {
  console.error('Usage: node scripts/optimize-media.mjs INPUT OUTPUT_DIRECTORY [cinematic|balanced|lightweight] [--silent]');
  process.exit(2);
}
const input = resolve(inputArg);
const directory = resolve(outputArg);
if (!existsSync(input) || !statSync(input).isFile()) throw Error('Input file not found');
mkdirSync(directory, { recursive: true });
const name = basename(input, extname(input)) + '-' + preset;
const output = join(directory, name + '.mp4');
const poster = join(directory, name + '.webp');
if (existsSync(output) || existsSync(poster) || input === output) throw Error('Refusing to overwrite an existing file');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
function run(bin, args) {
  const result = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr);
  return result;
}
function probe(file) {
  return JSON.parse(run(ffprobe, ['-v', 'error', '-select_streams', 'V:0', '-show_entries',
    'stream=codec_name,profile,level,width,height,r_frame_rate:format=duration,size', '-of', 'json', file]).stdout);
}
const source = probe(input);
const info = presets[preset];
const video = source.streams[0];
if (!video?.width || !video.height) throw Error('No video stream');
const [numerator, denominator] = video.r_frame_rate.split('/').map(Number);
const rate = Math.min(info.fps, numerator / denominator || info.fps);
const portrait = video.height >= video.width;
const width = portrait ? info.short : info.long;
const height = portrait ? info.long : info.short;
const scale = 'scale=w=min(iw\\,' + width + '):h=min(ih\\,' + height + '):force_original_aspect_ratio=decrease:force_divisible_by=2';
const filter = scale + ',fps=' + rate;
const silent = options.includes('--silent');
run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-n', '-i', input, '-map', '0:V:0',
  ...(silent ? ['-an'] : ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '96k']),
  '-vf', filter, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(info.crf),
  '-profile:v', info.profile, ...(preset === 'cinematic' ? [] : ['-level:v', '3.1']),
  '-pix_fmt', 'yuv420p', '-map_metadata', '-1', '-movflags', '+faststart', output]);
run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-n', '-ss', String(Math.min(1, Number(source.format.duration) / 3)),
  '-i', output, '-frames:v', '1', '-vf', 'scale=w=min(iw\\,480):h=-2', '-c:v', 'libwebp', '-quality', '85', poster]);
const result = probe(output);
const compare = run(ffmpeg, ['-hide_banner', '-i', input, '-i', output, '-lavfi',
  '[0:V:0]' + filter + ',format=yuv420p,setpts=PTS-STARTPTS[ref];[1:v:0]fps=' + rate +
  ',format=yuv420p,setpts=PTS-STARTPTS[enc];[ref][enc]ssim=shortest=1',
  '-an', '-f', 'null', '-']).stderr;
const ssim = Number(compare.match(/All:([0-9.]+)/)?.[1] || NaN);
console.log(JSON.stringify({ input, output, poster, preset, silent, source, result,
  ssim: Number.isFinite(ssim) ? ssim : null, bytesSaved: Number(source.format.size) - Number(result.format.size),
  note: 'SSIM compares at candidate resolution and frame rate; inspect visual quality and compare deployed sizes before replacement.' }, null, 2));
