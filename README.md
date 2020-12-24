# Album Splitter

A CLI tool for splitting an audio file into separate tracks based on timestamps using [ffmpeg](https://ffmpeg.org). Will ask the following information and adds it along with track numbers as metadata:
- album name
- artist name
- year of release

## Usage
`album-splitter <path-to-audio-file> <path-to-timestamps-file>`

Timestamps file format:

```
00:00:00 Song Title 1
00:02:45 Song Title 2
00:05:23 Song Title 3
```

## Dependencies
- [prompts](https://www.npmjs.com/package/prompts)

## Requirements
- ffmpeg installed globally
