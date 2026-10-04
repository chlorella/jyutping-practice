"""Generate public lesson text only; never submit user answers/progress.

Run in a scratch venv with edge-tts==7.2.8 installed. Existing clips are kept
unless --force is supplied. Fixed Hong Kong Cantonese voice, no voice cloning.
"""
import asyncio
import json
from pathlib import Path
import subprocess
import sys
import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VOICE = 'zh-HK-HiuGaaiNeural'

async def main():
    deck = json.loads(subprocess.check_output(['node', '-p', 'JSON.stringify(require("./deck.js"))'], cwd=ROOT))
    output = ROOT / 'audio'
    output.mkdir(exist_ok=True)
    sem = asyncio.Semaphore(4)
    force = '--force' in sys.argv
    async def generate(card):
        dest = output / (card['id'] + '.mp3')
        if dest.exists() and not force:
            return
        async with sem:
            for attempt in range(3):
                temp = dest.with_suffix('.part')
                try:
                    await edge_tts.Communicate(card['text'], VOICE).save(str(temp))
                    if temp.stat().st_size < 1000:
                        raise RuntimeError('Missing usable audio')
                    temp.replace(dest)
                    print(card['id'], card['text'], dest.stat().st_size, flush=True)
                    return
                except Exception:
                    temp.unlink(missing_ok=True)
                    if attempt == 2:
                        raise
                    await asyncio.sleep(2 ** attempt)
    await asyncio.gather(*(generate(card) for card in deck['cards']))
    manifest = {'voice': VOICE, 'engine': 'Microsoft Edge TTS via edge-tts 7.2.8', 'synthetic': True,
                'review': 'Container, duration and browser playback checked; not human phonetic review.',
                'clips': {card['id']: {'text': card['text'], 'file': card['id'] + '.mp3'} for card in deck['cards']}}
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print('Complete clips:', len(manifest['clips']))

if __name__ == '__main__':
    asyncio.run(main())
