import useAuth from "../../useAuth";
import { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap"
import SpotifyWebApi from 'spotify-web-api-node'
import TrackSearchResult from "../TrackSearchResult";
import Controls from "../Controls";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
    clientId: "1f0603885b3247c39be58a184a3791b9"
})

export const Dashboard = ({ code }) => {
    const accessToken = useAuth(code);
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState()
    const [lyrics, setLyrics] = useState("")
    console.log(lyrics)
    const chooseTrack = (track) => {
        setPlayingTrack(track)
        setSearch("")
        setLyrics("")
    }

    useEffect(() => {
        if (!playingTrack) return

        axios
            .get("http://localhost:3001/lyrics", {
                params: {
                    track: playingTrack.title,
                    artist: playingTrack.artist,
                },
            })
            .then(res => {
                setLyrics(res.data.lyrics)
            })
    }, [playingTrack])

    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])


    useEffect(() => {
        if (!search) return setSearchResults([])
        if (!accessToken) return

        let cancel = false
        spotifyApi.searchTracks(search).then(res => {
            if (cancel) return
            setSearchResults(
                res.body.tracks.items.map(track => {
                    const smallestAlbumImage = track.album.images.reduce(
                        (smallest, image) => {
                            if (image.height < smallest.height) return image
                            return smallest
                        },
                        track.album.images[0]
                    )

                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        albumUrl: smallestAlbumImage.url,
                    }
                })
            )
        })
        return () => (cancel = true)
    }, [search, accessToken])

    return (
        <Container className="d-flex flex-column py-2" style={{
            height: "100vh", 
        }}>
            <Form.Control
                type="search"
                placeholder="Search songs/artists"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{color: "#21AF54"}} />
            <div
                className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                {searchResults.map(track => (
                    <TrackSearchResult
                        track={track}
                        key={track.uri}
                        chooseTrack={chooseTrack} />
                ))}
                <Container fluid>
                    <div className="text-center"
                    style={{ whiteSpace:"pre", fontSize: "1.5em",  color: "white"}}>
                    {lyrics}
                    </div>
                </Container>
            </div>

            <div>
                <Controls accessToken={accessToken} trackUri={playingTrack?.uri} />
            </div>
        </Container>
    )

}
