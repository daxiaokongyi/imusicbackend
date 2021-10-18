const { default: axios } = require('axios');
const express = require('express'); 
const router = new express.Router();
const token = require('../getToken');
const Song = require('../models/songs');

// basic Apple API URL
const BASIC_API_URL = "https://api.music.apple.com/v1/catalog/us/search";
const BASIC_API_URL_SONG_DETAIL = "https://api.music.apple.com/v1/catalog/us/songs?ids=";

/** GET / Get songes with Search Terms
 */

router.get("/:searchTerm", async function (req, res, next) {
    console.log('testing search term');
    try {
        const result = await axios.get(`${BASIC_API_URL}?term=${req.params.searchTerm}&limit=8`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        let resultSongs = result.data.results.songs ? result.data.results.songs.data : [];
        let resultArtists = result.data.results.artists ? result.data.results.artists.data : [];
        let resultAlbums = result.data.results.albums ? result.data.results.albums.data : [];
        let resultPlaylists = result.data.results.playlists ? result.data.results.playlists.data : [];
        let resultMusicVideos = result.data.results["music-videos"] ? result.data.results["music-videos"].data : [];

        if (resultSongs.length === 0) {
            return res.status(201).json({notfound: 'no result found'});
        }

        if (resultSongs.length !== 0) {
            resultSongs = resultSongs.map(song => ({
                songId: song.id,
                songPreview: song.attributes.url,
                songDownloadPreview: song.attributes.previews[0].url,
                songName: song.attributes.name,
                songArtist: song.attributes.artistName,
                songGenreName: song.attributes.genreNames,
                songImageUrl: song.attributes.artwork.url
            }));
        } else {
            resultSongs = []
        }

        if (resultArtists.length !== 0) {
            resultArtists = resultArtists.map(artist => {
                let artistWithImage = artist.hasOwnProperty('relationships') ? artist.relationships.albums.data.filter(each => each.hasOwnProperty('attributes')) : [];

                return {
                    artistId: artist.id,
                    artistUrl :artist.attributes.url,
                    artistName : artist.attributes.name,
                    artistGenreNames : artist.attributes.genreNames,
                    artistImageUrl : artistWithImage.length !== 0 ? (artistWithImage[0].hasOwnProperty('attributes') ? artistWithImage[0].attributes.artwork.url : '') : (artist.hasOwnProperty('attributes') ? (artist.attributes.hasOwnProperty('artwork') ? artist.attributes.artwork.url : '') : '')
                }
            });
        } else {
            resultArtists = []
        }

        if (resultAlbums.length !== 0) {
            resultAlbums = resultAlbums.map(album => ({
                albumId: album.id,
                albumUrl : album.attributes.url,
                albumArtist: album.attributes.artistName,
                albumName: album.attributes.name,
                albumReleaseDate: album.attributes.releaseDate,
                albumImageUrl: album.attributes.artwork.url
            }));
        } else {
                resultAlbums = []
        }

        if (resultPlaylists.length !== 0) {
            resultPlaylists = resultPlaylists.map(playlist => ({
                playlistId: playlist.id,
                playlistDescription: playlist.attributes.description ? playlist.attributes.description.standard : "",
                playlistUrl: playlist.attributes.url,
                playlistName: playlist.attributes.name,
                playlistImageUrl: playlist.attributes.artwork.url
            }));
        } else {
                resultPlaylists = []
        }

        if (resultMusicVideos.length !== 0) {
            resultMusicVideos = resultMusicVideos.map(video => ({
                videoId: video.id,
                videoPreviewUrl : video.attributes.previews[0].url,
                videoHlsUrl : video.attributes.previews[0].hlsUrl,
                videoUrl : video.attributes.url,
                videoName: video.attributes.name,
                videoDuration: video.attributes.durationInMillis,
                videoReleaseDate: video.attributes.releaseDate,
                videosImageUrl: video.attributes.artwork.url
            }));
        } else {
            resultMusicVideos = []
        }

        return res.status(201).json({songs:resultSongs, artists: resultArtists, albums: resultAlbums, playlists: resultPlaylists, musicVideos: resultMusicVideos});
    } catch (error) {
        console.log(`error is here: ${JSON.stringify(error)}`);
        return next(error);
    }
});

router.post("/songDetail/:songId", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL_SONG_DETAIL}${req.params.songId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const ifFavorited = await Song.checkIfFavorited(req.params.songId, req.body.username);

        const songDetail = result.data.data[0];

        return res.status(201).json({
            songDetail: {
                ...songDetail,
                favorited : ifFavorited
            }
        })
    } catch (error) {
        return next(error);
    }
});

router.get("/artists/:searchArtistItem", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL}?types=artists&term=${req.params.searchArtistItem}`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        const allArtistsResult = result.data;
        return res.status(201).json({artists: allArtistsResult.results.artists.data});
    } catch (error) {
        return next(error);
    }
});

router.get("/songs/:searchSongItem", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL}?limit=25&types=songs&term=${req.params.searchSongItem}`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        const allSongsResult = result.data;

        return res.status(201).json({songs: allSongsResult.results.songs.data});
    } catch (error) {
        return next(error);
    }
});

router.get("/albums/:searchAlbumItem", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL}?limit=25&types=albums&term=${req.params.searchAlbumItem}`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        const allAlbumsResult = result.data;
        return res.status(201).json({albums: allAlbumsResult.results.albums.data});
    } catch (error) {
        return next(error);
    }
});

router.get("/playlists/:searchPlaylistItem", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL}?limit=25&types=playlists&term=${req.params.searchPlaylistItem}`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        const allPlaylistsResult = result.data;
        return res.status(201).json({playlists: allPlaylistsResult.results.playlists.data});
    } catch (error) {
        return next(error);
    }
});

router.get("/videos/:searchVideoItem", async function (req, res, next) {
    try {
        const result = await axios.get(`${BASIC_API_URL}?limit=25&types=music-videos&term=${req.params.searchVideoItem}`, {
            headers: {
                'Authorization':`Bearer ${token}`
            }
        });

        const allVideosResult = result.data.results["music-videos"].data;
        return res.status(201).json({videos: allVideosResult});
    } catch (error) {
        return next(error);
    }
});

module.exports = router;