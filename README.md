# <p align="center">ANITAKU API</p>

<div align="center">
Another anitaku API serving anime information from anitaku website
</div>

> [!IMPORTANT]
>
> 1. This API is just an unofficial api for [anitaku](https://anitaku.pe) and is in no other way officially related to the same.
> 2. The content that this api provides is not mine, nor is it hosted by me. These belong to their respective owners. This api just demonstrates how to build an api that scrapes websites and uses their content.

#### Acknowledgement

[Consumet](https://github.com/consumet/consumet.ts) inspiring mo to build my own.

### Vercel

Deploy your own instance of Anitaku API on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/benjoquilario/anitaku-api)

### Documentation

#### Endpoint

```bash
https://gogoanime-api-eta.vercel.app
```

<details>
<summary>

### `GET` Search Anime

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/search/naruto"
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

</summary>
</details>

<details>
<summary>

### `GET` Anime Information

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/info/naruto")
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

</summary>
</details>

### `GET` Watch Episode

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/watch/naruto-episode-1"
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

</summary>
</details>

### `GET` Servers Episode ID

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/servers/naruto-episode-1"
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

</summary>
</details>

### `GET` Recents Episodes

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/recent-episodes"
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

</summary>
</details>

### `GET` Anime By Genre

#### Request sample

```javascript
const response = await fetch(
  "https://gogoanime-api-eta.vercel.app/genre/action"
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

</summary>
</details>

### `GET` Top Airing Anime

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/top-airing")
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

</summary>
</details>

### `GET` Popular Anime

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/popular")
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

</summary>
</details>

### `GET` Movies Anime

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/movies")
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

</summary>
</details>

### `GET` Anime List

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/anime-list")
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

</summary>
</details>

### `GET` New Season Anime

#### Request sample

```javascript
const response = await fetch("https://gogoanime-api-eta.vercel.app/new-season")
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

</summary>
</details>
