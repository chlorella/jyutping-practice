# Sources and attribution

## Course

TypeDuck Cantonese Keyboard, 【廣東話教室】52 分鐘學識 LSHK 粵拼（中文科老師、語言學同學必睇）:
https://www.youtube.com/watch?v=MOsf0BcLzlc

The exercise sequence follows the course themes. The course was reviewed using the full Cantonese caption track and targeted slide checks, not continuous audiovisual viewing. Approximate timestamps are derived from the captions, not official chapters. Educational notes are new paraphrases; application sentences are new examples. No downloaded video, audio, slides or raw transcript are redistributed. No endorsement or affiliation is implied.

One subtitle error was checked against the slide: 見／電／面 use `in`, not `im`. All exercise readings were checked against the dictionary below. Readings describe the selected textbook pronunciation, not a judgment of accent variation or an exhaustive list of word senses.

## Romanization

The Linguistic Society of Hong Kong (LSHK), Jyutping scheme:
https://lshk.org/jyutping-scheme/

This is an independent practice tool, not an official LSHK product. It does not cover every valid Cantonese syllable and does not assess pronunciation.

## Dictionary readings

Rime Cantonese / rime-cantonese project contributors:
https://github.com/rime/rime-cantonese

Pinned revision: `259f0e48bba840c3a2e0d117539e96937f3d89bc`.
Source file: `jyut6ping3.chars.dict.yaml`.
The selected character-reading data used to verify the exercise deck are licensed under Creative Commons Attribution 4.0 International (CC BY 4.0):
https://creativecommons.org/licenses/by/4.0/

Changes: selected and arranged into a small practice deck, paired with course themes and newly composed application sentences; the complete original dictionary is not included. Its upstream license text is supplied as `LICENSE-DATA.txt`.

## Synthetic read-aloud audio

The `audio/` clips are generated from the card text using Microsoft's Hong Kong Cantonese `zh-HK-HiuGaaiNeural` voice via `edge-tts` 7.2.8. No voice cloning, teacher recordings, or source-video audio is included. `audio/manifest.json` records the voice and text-to-file mapping. Audio has been checked for container validity, nonzero duration and browser playback, but not human-reviewed for every target syllable. Polyphonic characters may be read differently from the exercise's selected pronunciation. These synthesized audio assets are separate from the upstream dictionary-data license and the application-code license; no MIT/CC relicensing of third-party voice technology is implied.

Voice reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
Generation tool: https://github.com/rany2/edge-tts

## Initial / final demonstration audio

Open Cantonese, *Cantonese Life 1*, pronunciation guide / Jyutping chart:
https://opencantonese.org/books/cantonese-life-1/pronunciation-guide/jyutping-chart

The chart provides separately named `initial-*.mp3` and `final-*.mp3` samples, mapped in `sounds.js`. The book's public-use statement says it may be used to learn or teach Cantonese: https://opencantonese.org/books/cantonese-life-1 . No broader redistribution license is assumed. The app links directly to the original source files, fetched only after a playback tap; copies of these recordings are **not** committed or hosted in this repository. They are not MIT/CC-relicensed by this app and are not the TypeDuck video's teacher recordings. There is no affiliation or endorsement.

The UI groups the samples for navigation and labels `eo` as a nucleus; initial demonstrations may include a supporting vowel. Audio filenames, decoding/duration and browser playback were checked, not an independent phonetic accuracy review. This network-dependent feature sends a request for the selected public sound asset only, not the learner's card text, answers or review records.

## Application code

Original application code is MIT licensed; see `LICENSE`. Source data retains its separate license above.
