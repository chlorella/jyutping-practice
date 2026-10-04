# 粵拼小練習

A small, mobile-friendly Jyutping recall and typing practice page, based on the themes in TypeDuck's 52-minute LSHK Jyutping lesson.

- 115 practice cards across 11 video themes and one application-sentence lesson.
- Spelling mode: English keyboard, optional tone numbers.
- Typing mode: select your installed TypeDuck keyboard and commit Chinese text.
- Stepwise hints, simple spaced review, per-mode local progress, JSON export/import.
- Static, no accounts, no AI/model fees, no analytics or progress upload.

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

See [ATTRIBUTION.md](ATTRIBUTION.md) for course, LSHK scheme and dictionary sources.
