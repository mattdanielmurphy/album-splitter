# Album Splitter

A CLI tool for splitting an audio file into separate tracks based on timestamps using [ffmpeg](https://ffmpeg.org). Will ask the following information and adds it along with track numbers as metadata:

- album name
- artist name
- year of release

## Usage

- **Note: requires [ffmpeg](https://ffmpeg.org) installed globally.**
- To split a file, use the following command:

```
album-splitter <path-to-audio-file> <path-to-timestamps-file>
```

Timestamps file format:

```
00:00:00 Song Title 1
00:02:45 Song Title 2
00:05:23 Song Title 3
```

(These timestamp variations will also work:)

```
2:45
1:02:45
01:2:04
```

## Dependencies

- [prompts](https://www.npmjs.com/package/prompts)

## Requirements

- ffmpeg installed globally

## To Do

- Improve error reporting
  - timestamps are out of order (track start time is used as end time for prev. track, so won't work if out of order)
