# 粵拼小練習

A small, mobile-friendly Jyutping recall and typing practice page, based on the themes in TypeDuck's 52-minute LSHK Jyutping lesson.

- 115 practice cards across 11 video themes and one application-sentence lesson.
- Spelling mode: English keyboard, optional tone numbers.
- Typing mode: select your installed TypeDuck keyboard and commit Chinese text.
- Stepwise hints, simple spaced review, per-mode local progress, JSON export/import.
- Static, no accounts, no runtime model fees, no analytics or progress upload.
- 115 pre-generated Hong Kong Cantonese MP3 clips, tap-to-play at 1× or pitch-preserving 0.75×.

This is not an input method: the page checks committed Chinese text and cannot observe IME keystrokes, verify which keyboard was used, or evaluate pronunciation. Phone and Mac records are independent; transfer them using export/import. A browser's site-data clearing removes its progress. No automatic cloud sync or offline caching.

## Run and test

Serve this folder with any static server. Development tests:

```sh
npm ci
npm test
npm run test:browser
```

The browser suite currently uses installed Google Chrome, with desktop and emulated iPhone layouts. It tests composition events, spelling/typing, storage and export/import. It does **not** prove native iPhone Safari or actual TypeDuck candidate selection. No build step is required for hosting.

## GitHub Pages

Publish `main` from the repository root. Relative asset URLs work under a project subpath. `.nojekyll` keeps the static files unchanged.

Public repository contains code, tests, course-derived exercise notes and attributed reading data only. Personal progress and raw source media/transcripts are not committed.

## Personal flashcards

Open **自訂 Flashcards**, enter a Chinese word (1–24 Han characters), one Jyutping syllable per character with a 1–6 tone number, and optional note. Save, tap the front to flip, or use **練我嘅卡** to practise with the same per-mode review scheduler. Edit/delete controls are local only. Editing clears that card's old review records so an altered answer is not incorrectly marked mastered.

**將目前題目存成自訂卡** prefills the current target and your previous answer as a note; you choose whether to save it. JSON progress exports include all personal cards and review records. TSV export contains front / Jyutping / note for flashcard import (three fields; no header). Old backups without personal cards remain compatible. Nothing is uploaded; browser/site-data clearing removes the cards, so export a backup. Devices do not auto-sync.

Custom Jyutping is user-supplied: syntax checks are not dictionary verification. Custom-card audio uses only a device-provided **local** Cantonese voice (`zh-HK`/`yue`); it never falls back to Mandarin or sends card text to a cloud TTS service. Missing local voices produce an explanatory message; custom audio availability is device-dependent. Built-in lesson audio remains pre-generated MP3.

## Separate initial / final sounds

Open **聲母／韻母分開聽** near the top, then tap a Jyutping symbol. The library maps 19 initial demonstrations and 60 final / nucleus / syllabic-nasal demonstrations from Open Cantonese's *Cantonese Life 1* Jyutping chart. `eo` is explicitly labelled as a nucleus in `eoi/eon/eot`, not an arbitrary standalone final. Zero initial is explained rather than given a fake audio clip. Initial demonstrations may include a supporting vowel; these are phonetic demonstrations, not English letter names or the video's teacher recordings.

Audio loads **directly from opencantonese.org only after a tap**; no personal flashcards, answers or progress are sent. This needs a network connection and depends on that source remaining available. Normal / pitch-preserving 0.75× speed, stop, source link and failure message are available. The original video links remain the reference for blending. One player prevents overlapping initial/final playback; playing a flashcard, changing cards, closing the sound panel or hiding the tab stops it.

The source book says it is free to use to learn or teach Cantonese. This app links to the original audio rather than redistributing copies. Source: https://opencantonese.org/books/cantonese-life-1/pronunciation-guide/jyutping-chart ; book-use statement: https://opencantonese.org/books/cantonese-life-1 . Source speech has not been independently phonetically reviewed here. Browser tests cover playback on desktop Chrome and an emulated phone, not native iPhone Safari.

## Read-aloud audio

Audio uses `zh-HK-HiuGaaiNeural` through `edge-tts==7.2.8`, generated from public card text only. It is synthetic read-aloud speech, **not the video teacher's recordings, not phonetic gold-standard audio, and not human-reviewed for every polyphonic character**. Use the displayed Jyutping/course as the reference if the synthesized reading differs. Listening counts as assisted recall and never exposes the written spelling automatically.

`preload="none"` prevents loading all clips on page open; a user tap starts playback. Changing cards stops the old clip. A failed playback shows a retry message without blocking typing. The browser does not send answers or progress to a TTS provider. These are static MP3 files hosted beside the page.

Regenerate using the optional `scripts/generate_audio.py` in a separate Python environment with `edge-tts==7.2.8`. Generation submits card text to the service, not personal progress. All clips were checked for valid MP3 decoding and duration; browser tests exercise real playback, not mocked media.

See [ATTRIBUTION.md](ATTRIBUTION.md) for course, LSHK scheme and dictionary sources.
