# Documentation on how to used gogoanime endpoint

- [search](#SearchAnime)
- [fetchAnimeInfo](#AnimeInformation)
- [fetchEpisodeSources](#WatchEpisode)
- [fetchEpisodeServers](#EpisodeServers)
- [fetchRecentEpisodes](#RecentEpisodes)
- [fetchGenreInfo](#AnimeGenre)
- [fetchPopular](#Popular)
- [fetchGenreList](#GenreList)
- [fetchTopAiring](#TopAiring)
- [fetchAnimeList](#AnimeList)
- [fetchAnimeMovies](#AnimeMovies)
- [fetchNewSeason](#NewSeason)
- [fetchDirectDownloadLink](#DirectLink)

#### Endpoint

```bash
https://gogoanime-api-eta.vercel.app/anime/gogoanime
```

### SearchAnime

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/search/naruto"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": null,
  "hasNextPage": true,
  "results": [
    {
      "id": "naruto",
      "title": "Naruto",
      "url": "https://anitaku.pe//category/naruto",
      "image": "https://gogocdn.net/images/anime/N/naruto.jpg",
      "releaseDate": "Released: 2002",
      "subOrDub": "sub"
    },
  ]
}
```

### AnimeInformation

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/info/naruto"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "id": "naruto",
  "title": "Naruto",
  "url": "https://anitaku.pe/category/naruto",
  "genres": [
    "Action",
    "Comedy",
    "Martial Arts",
    "Shounen",
    "Super Power"
  ],
  "totalEpisodes": 220,
  "image": "https://gogocdn.net/images/anime/N/naruto.jpg",
  "releaseDate": "2002",
  "description": "...",
  "subOrDub": "sub",
  "type": "TV SERIES",
  "status": "Completed",
  "otherName": "\nナルト\n",
  "episodes": [
    {
      "id": "naruto-episode-1",
      "number": 1,
      "url": "https://anitaku.pe//naruto-episode-1"
    }
  ]
}
```

### WatchEpisode

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/watch/naruto-episode-1"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "headers": {
    "Referer": "..."
  },
  "sources": [
    {
      "url": "...",
      "isM3U8": true,
      "quality": "default"
    },
  ],
  "download": "..."
}
```

### EpisodeServers

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/servers/naruto-episode-1"
)
const data = await response.json()
```

#### Response Schema

```javascript
;[
  {
    name: "Vidstreaming",
    url: "...",
  },
  {
    name: "Gogo server",
    url: "...",
  },
  {
    name: "Streamwish",
    url: "...",
  },
  {
    name: "Doodstream",
    url: "...",
  },
  {
    name: "Vidhide",
    url: "...",
  },
]
```

### RecentEpisodes

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/recent-episodes"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "episodeId": "...",
      "episodeNumber": 16,
      "title": "...",
      "image": "...",
      "url": "..."
    },
  ]
  ...
}
```

### AnimeGenre

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/genre/action"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "released": "2025",
      "url": "..."
    },
  ]
}
```

### TopAiring

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/top-airing"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "genres": [
        "Comedy",
        "Romance",
        "School"
      ]

      "url": "..."
    },
  ]
}
```

### Popular

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/popular"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "genres": [
        "Comedy",
        "Romance",
        "School"
      ]

      "url": "..."
    },
  ]
}
```

### Movies

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/movies"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "genres": [
        "Comedy",
        "Romance",
        "School"
      ]

      "url": "..."
    },
  ]
}
```

### AnimeList

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/anime-list"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "genres": [
        "Comedy",
        "Romance",
        "School"
      ]
      "releaseDate": "Released: 2007",
      "url": "..."
    },
  ]
}
```

### NewSeason

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/anime/gogoanime/new-season"
)
const data = await response.json()
```

#### Response Schema

```javascript
{
  "currentPage": 1,
  "hasNextPage": true,
  "results": [
    {
      "id": "...",
      "title": "...",
      "image": "...",
      "genres": [
        "Comedy",
        "Romance",
        "School"
      ]
      "releaseDate": "Released: 2007",
      "url": "..."
    },
  ]
}
```
