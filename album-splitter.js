const prompts = require('prompts')
const process = require('process')
const path = require('path')
const fs = require('fs/promises')
const fsSync = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const [, , pathToAudioFile, pathToTimestampsFile] = process.argv

function cleanName(name) {
  name = name.replace(/\s+/gi, '-') // Replace white space with dash
  return name.replace(/[^a-zA-Z0-9\-]/gi, '') // Strip any special charactere
}

async function makeTrack(song, releaseInfo, saveDirectory) {
  const fileExtension = /(?:\.([^.]+))?$/.exec(pathToAudioFile)[0]
  const fileName = `${song.trackNumber}-${
    cleanName(song.title) + fileExtension
  }`
  const savePath = path.join(saveDirectory, fileName)
  const command = `ffmpeg -y -nostdin -loglevel 16 -i "${pathToAudioFile}" -ss "${
    song.startTime
  }" ${
    song.endTime ? `-to "${song.endTime}"` : ''
  } -vn -c copy -metadata track="${song.trackNumber}" -metadata title="${
    song.title
  }" -metadata artist="${releaseInfo.artist}" -metadata album_artist="${
    releaseInfo.artist
  }" -metadata album="${releaseInfo.album}" -metadata year="${
    releaseInfo.year
  }" -metadata genre="${releaseInfo.genre}" "${savePath}"`
  try {
    await exec(command)
    console.log(`${fileName} saved successfully.`)
  } catch (e) {
    console.log(`ERROR at track #${song.trackNumber}\n`, e.stderr)
  }
}

async function sliceAudioIntoTracks(songs, releaseInfo) {
  const cleanAlbumName = cleanName(releaseInfo.album)
  const cleanArtistName = cleanName(releaseInfo.artist)
  const saveDirectory = path.join(
    __dirname,
    `${cleanAlbumName}-${cleanArtistName}`,
  )
  if (!fsSync.existsSync(saveDirectory)) {
    await fs.mkdir(saveDirectory, 0744)
  }
  await Promise.all(
    songs.map(
      async (song) => await makeTrack(song, releaseInfo, saveDirectory),
    ),
  )
  console.log(`Done. Files saved to ${saveDirectory}`)
}

async function getSongTitlesAndTimestamps() {
  try {
    const data = await fs.readFile(pathToTimestampsFile, 'utf8')
    const songs = data.split('\n').map((song, index) => {
      const matches = song.match(/(\d?\d:\d\d:?\d?\d?)\s(.*)/)
      // prepend leading zeros if necessary
      const startTime = matches[1].replace(/\b\d:/, '0$&')
      return { startTime, title: matches[2], trackNumber: index + 1 }
    })

    const songsWithEndTimestamps = [...songs]
    songs.forEach((song, index) => {
      if (index > 0) {
        songsWithEndTimestamps[index - 1].endTime = song.startTime
      }
    })
    return songsWithEndTimestamps
  } catch (error) {
    console.error('there was an error:', error.message)
  }
}

async function getReleaseInfoFromUser() {
  const questions = [
    {
      type: 'text',
      name: 'album',
      message: 'What is the name of the album?',
    },
    {
      type: 'text',
      name: 'artist',
      message: 'What is the name of the artist?',
    },
    {
      type: 'text',
      name: 'genre',
      message: 'What is the genre?',
    },
    {
      type: 'number',
      name: 'year',
      message: 'What is the year this album was released?',
    },
  ]
  // Testing:
  // return {
  //   album: 'Album Name',
  //   artist: 'Artist Name',
  //   genre: 'Genre Name',
  //   year: 2112,
  // }
  return await prompts(questions)
}

async function splitAlbum() {
  const [songTitlesAndTimestamps, releaseInfo] = await Promise.all([
    getSongTitlesAndTimestamps(),
    getReleaseInfoFromUser(),
  ])

  sliceAudioIntoTracks(songTitlesAndTimestamps, releaseInfo)
}

splitAlbum()
