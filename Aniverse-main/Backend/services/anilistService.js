import axios from "axios";

const ANILIST_API_URL = process.env.ANILIST_API_URL || "https://graphql.anilist.co";
const CACHE_TTL_MS = Number(process.env.ANILIST_CACHE_TTL_MS || 5 * 60 * 1000);
const cache = new Map();

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  description(asHtml: false)
  coverImage { extraLarge large color }
  bannerImage
  format
  status
  episodes
  duration
  genres
  averageScore
  popularity
  favourites
  season
  seasonYear
  startDate { year month day }
  endDate { year month day }
  nextAiringEpisode { episode airingAt }
  studios(isMain: true) { nodes { id name } }
`;

const GENRE_ALIASES = {
  action: "Action",
  adventure: "Adventure",
  comedy: "Comedy",
  drama: "Drama",
  ecchi: "Ecchi",
  fantasy: "Fantasy",
  horror: "Horror",
  "mahou-shoujo": "Mahou Shoujo",
  mecha: "Mecha",
  music: "Music",
  mystery: "Mystery",
  psychological: "Psychological",
  romance: "Romance",
  "sci-fi": "Sci-Fi",
  "slice-of-life": "Slice of Life",
  sports: "Sports",
  supernatural: "Supernatural",
  thriller: "Thriller",
};

const FORMAT_ALIASES = {
  tv: "TV",
  movie: "MOVIE",
  ova: "OVA",
  ona: "ONA",
  special: "SPECIAL",
  music: "MUSIC",
  "tv-short": "TV_SHORT",
};

const STATUS_ALIASES = {
  "finished-airing": "FINISHED",
  completed: "FINISHED",
  "currently-airing": "RELEASING",
  "top-airing": "RELEASING",
  "not-yet-aired": "NOT_YET_RELEASED",
  "top-upcoming": "NOT_YET_RELEASED",
};

const SORT_ALIASES = {
  score: ["SCORE_DESC"],
  popularity: ["POPULARITY_DESC"],
  date: ["START_DATE_DESC"],
  title: ["TITLE_ROMAJI"],
  "recently-added": ["ID_DESC"],
  "recently-updated": ["UPDATED_AT_DESC"],
};

function getCached(key) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value, ttl = CACHE_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

async function queryAniList(query, variables = {}, cacheKey, ttl) {
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const response = await axios.post(
    ANILIST_API_URL,
    { query, variables },
    {
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Aniverse/1.0 (AniList metadata client)",
      },
    }
  );

  if (response.data?.errors?.length) {
    throw new Error(response.data.errors.map((error) => error.message).join("; "));
  }

  const data = response.data?.data;
  if (!data) throw new Error("AniList returned an empty response");
  return cacheKey ? setCached(cacheKey, data, ttl) : data;
}

function stripMarkup(value = "") {
  return String(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function titleOf(media) {
  return media?.title?.english || media?.title?.romaji || media?.title?.native || "Untitled";
}

function releasedEpisodes(media) {
  if (media?.nextAiringEpisode?.episode) return Math.max(media.nextAiringEpisode.episode - 1, 0);
  return media?.episodes || 0;
}

function formatLabel(format) {
  return format ? format.replaceAll("_", " ") : "Anime";
}

function mapCard(media) {
  if (!media) return null;
  const episodes = releasedEpisodes(media);
  return {
    id: String(media.id),
    anilistId: media.id,
    malId: media.idMal || null,
    name: titleOf(media),
    title: titleOf(media),
    poster: media.coverImage?.extraLarge || media.coverImage?.large || media.bannerImage || "",
    banner: media.bannerImage || media.coverImage?.extraLarge || "",
    description: stripMarkup(media.description),
    type: formatLabel(media.format),
    rating: media.averageScore ? `${media.averageScore}%` : null,
    episodes: { sub: episodes || media.episodes || null, dub: null },
    status: media.status,
    season: media.season,
    year: media.seasonYear || media.startDate?.year || null,
    genres: media.genres || [],
  };
}

function mapPage(page) {
  return {
    animes: (page?.media || []).map(mapCard).filter(Boolean),
    currentPage: page?.pageInfo?.currentPage || 1,
    totalPages: page?.pageInfo?.lastPage || 1,
    hasNextPage: Boolean(page?.pageInfo?.hasNextPage),
  };
}

function normalizeGenre(value = "") {
  const key = decodeURIComponent(value).trim().toLowerCase().replaceAll(" ", "-");
  return GENRE_ALIASES[key] || decodeURIComponent(value).replaceAll("-", " ");
}

function normalizeCategory(value = "") {
  return decodeURIComponent(value).trim().toLowerCase().replaceAll("_", "-");
}

function categoryOptions(category) {
  const name = normalizeCategory(category);
  const options = { sort: ["POPULARITY_DESC"] };

  if (FORMAT_ALIASES[name]) options.format = FORMAT_ALIASES[name];
  if (STATUS_ALIASES[name]) options.status = STATUS_ALIASES[name];
  if (name === "most-favorite") options.sort = ["FAVOURITES_DESC"];
  if (name === "most-popular") options.sort = ["POPULARITY_DESC"];
  if (name === "recently-updated") options.sort = ["UPDATED_AT_DESC"];
  if (name === "recently-added") options.sort = ["ID_DESC"];
  if (name === "top-upcoming") {
    options.status = "NOT_YET_RELEASED";
    options.sort = ["POPULARITY_DESC"];
  }
  if (name === "top-airing") {
    options.status = "RELEASING";
    options.sort = ["SCORE_DESC", "POPULARITY_DESC"];
  }

  return options;
}

const PAGE_QUERY = `
  query AnimePage(
    $page: Int,
    $perPage: Int,
    $search: String,
    $genre: String,
    $format: MediaFormat,
    $status: MediaStatus,
    $season: MediaSeason,
    $seasonYear: Int,
    $sort: [MediaSort],
    $startDateGreater: FuzzyDateInt,
    $averageScoreGreater: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage lastPage hasNextPage total }
      media(
        type: ANIME,
        isAdult: false,
        search: $search,
        genre: $genre,
        format: $format,
        status: $status,
        season: $season,
        seasonYear: $seasonYear,
        sort: $sort,
        startDate_greater: $startDateGreater,
        averageScore_greater: $averageScoreGreater
      ) { ${MEDIA_FIELDS} }
    }
  }
`;

export async function getHomeData() {
  const currentYear = new Date().getUTCFullYear();
  const query = `
    query Home($year: Int) {
      spotlight: Page(page: 1, perPage: 10) {
        media(type: ANIME, isAdult: false, status: RELEASING, sort: [TRENDING_DESC, POPULARITY_DESC]) { ${MEDIA_FIELDS} }
      }
      trending: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, sort: [TRENDING_DESC]) { ${MEDIA_FIELDS} }
      }
      latest: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, status: RELEASING, sort: [UPDATED_AT_DESC]) { ${MEDIA_FIELDS} }
      }
      upcoming: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, status: NOT_YET_RELEASED, sort: [POPULARITY_DESC]) { ${MEDIA_FIELDS} }
      }
      airing: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, status: RELEASING, sort: [SCORE_DESC, POPULARITY_DESC]) { ${MEDIA_FIELDS} }
      }
      popular: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) { ${MEDIA_FIELDS} }
      }
      favorite: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, sort: [FAVOURITES_DESC]) { ${MEDIA_FIELDS} }
      }
      completed: Page(page: 1, perPage: 12) {
        media(type: ANIME, isAdult: false, status: FINISHED, endDate_greater: 20200101, sort: [END_DATE_DESC]) { ${MEDIA_FIELDS} }
      }
      season: Page(page: 1, perPage: 10) {
        media(type: ANIME, isAdult: false, seasonYear: $year, sort: [SCORE_DESC]) { ${MEDIA_FIELDS} }
      }
      GenreCollection
    }
  `;
  const data = await queryAniList(query, { year: currentYear }, "home", 5 * 60 * 1000);
  const trending = (data.trending?.media || []).map(mapCard);
  const airing = (data.airing?.media || []).map(mapCard);
  const popular = (data.popular?.media || []).map(mapCard);
  const top = popular.slice(0, 10);

  return {
    spotlightAnimes: (data.spotlight?.media || []).map(mapCard),
    trendingAnimes: trending,
    latestEpisodeAnimes: (data.latest?.media || []).map(mapCard),
    topUpcomingAnimes: (data.upcoming?.media || []).map(mapCard),
    topAiringAnimes: airing,
    mostPopularAnimes: popular,
    mostFavoriteAnimes: (data.favorite?.media || []).map(mapCard),
    latestCompletedAnimes: (data.completed?.media || []).map(mapCard),
    top10Animes: { today: top, week: trending.slice(0, 10), month: airing.slice(0, 10) },
    genres: data.GenreCollection || [],
  };
}

export async function getCategoryData(name, page = 1) {
  const variables = { page: Number(page) || 1, perPage: 20, ...categoryOptions(name) };
  const data = await queryAniList(PAGE_QUERY, variables, `category:${name}:${variables.page}`);
  return mapPage(data.Page);
}

export async function getGenreData(name, page = 1) {
  const variables = {
    page: Number(page) || 1,
    perPage: 20,
    genre: normalizeGenre(name),
    sort: ["POPULARITY_DESC"],
  };
  const data = await queryAniList(PAGE_QUERY, variables, `genre:${variables.genre}:${variables.page}`);
  return mapPage(data.Page);
}

export async function getProducerData(name, page = 1) {
  const producerName = decodeURIComponent(name).replaceAll("-", " ");
  const producerQuery = `
    query StudioMedia($search: String, $page: Int, $perPage: Int) {
      Studio(search: $search) {
        id
        name
        media(page: $page, perPage: $perPage, sort: [POPULARITY_DESC], isMain: true) {
          pageInfo { currentPage lastPage hasNextPage total }
          nodes { ${MEDIA_FIELDS} }
        }
      }
    }
  `;
  const variables = { search: producerName, page: Number(page) || 1, perPage: 20 };
  const data = await queryAniList(producerQuery, variables, `producer:${producerName}:${variables.page}`);
  if (!data.Studio) return { producerName, animes: [], hasNextPage: false };
  const media = data.Studio.media;
  return {
    producerName: data.Studio.name,
    animes: (media?.nodes || []).map(mapCard),
    currentPage: media?.pageInfo?.currentPage || 1,
    totalPages: media?.pageInfo?.lastPage || 1,
    hasNextPage: Boolean(media?.pageInfo?.hasNextPage),
  };
}

function parseSearchInput(raw = "") {
  const [search, ...parts] = decodeURIComponent(raw).replaceAll("+", " ").split("&");
  const filters = Object.fromEntries(
    parts.map((part) => part.split("=")).filter(([key]) => key)
  );
  return { search: search.trim(), filters };
}

function compactVariables(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

export async function searchAnime(raw, suggestionsOnly = false) {
  const { search, filters } = parseSearchInput(raw);
  if (!search) return suggestionsOnly ? [] : { animes: [], searchFilters: {} };

  const category = categoryOptions(filters.type || "");
  const year = filters.start_date?.match(/^\d{4}/)?.[0];
  const scoreMap = { good: 60, "very-good": 75, bad: 1 };
  const variables = compactVariables({
    page: 1,
    perPage: suggestionsOnly ? 8 : 20,
    search,
    genre: filters.genres ? normalizeGenre(filters.genres) : undefined,
    format: category.format,
    status: STATUS_ALIASES[filters.status] || category.status,
    season: filters.season?.toUpperCase(),
    seasonYear: year ? Number(year) : undefined,
    sort: SORT_ALIASES[filters.sort] || category.sort || ["SEARCH_MATCH", "POPULARITY_DESC"],
    startDateGreater: filters.start_date ? Number(filters.start_date.replaceAll("-", "").padEnd(8, "0")) : undefined,
    averageScoreGreater: scoreMap[filters.score],
  });

  const data = await queryAniList(PAGE_QUERY, variables, `search:${JSON.stringify(variables)}`, 2 * 60 * 1000);
  const animes = (data.Page?.media || []).map(mapCard);
  if (suggestionsOnly) {
    return animes.map((anime) => ({
      ...anime,
      moreInfo: [anime.year, anime.type, anime.status?.replaceAll("_", " ")],
    }));
  }
  return { ...mapPage(data.Page), searchFilters: filters };
}

export async function getAnimeDetails(id) {
  const animeId = Number(id);
  if (!Number.isInteger(animeId)) throw new Error("AniList anime ID must be numeric");

  const query = `
    query AnimeDetails($id: Int!) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
        source
        countryOfOrigin
        synonyms
        trailer { id site thumbnail }
        relations {
          edges { relationType node { ${MEDIA_FIELDS} } }
        }
        recommendations(page: 1, perPage: 12, sort: RATING_DESC) {
          nodes { rating mediaRecommendation { ${MEDIA_FIELDS} } }
        }
        characters(page: 1, perPage: 12, sort: [ROLE, RELEVANCE]) {
          edges {
            role
            node { id name { full native } image { large } }
            voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
              id name { full native } image { large } languageV2
            }
          }
        }
      }
    }
  `;
  const data = await queryAniList(query, { id: animeId }, `detail:${animeId}`, 10 * 60 * 1000);
  const media = data.Media;
  if (!media) throw new Error("Anime not found on AniList");

  const card = mapCard(media);
  const studios = media.studios?.nodes?.map((studio) => studio.name) || [];
  const relatedAnimes = (media.relations?.edges || [])
    .filter((edge) => edge.node)
    .map((edge) => ({ ...mapCard(edge.node), relationType: edge.relationType }));
  const recommendedAnimes = (media.recommendations?.nodes || [])
    .filter((item) => item.mediaRecommendation)
    .map((item) => mapCard(item.mediaRecommendation));
  const charactersVoiceActors = (media.characters?.edges || []).map((edge) => {
    const actor = edge.voiceActors?.[0];
    return {
      character: {
        id: edge.node.id,
        name: edge.node.name?.full || edge.node.name?.native,
        poster: edge.node.image?.large,
      },
      voiceActor: actor
        ? { id: actor.id, name: actor.name?.full || actor.name?.native, poster: actor.image?.large, cast: actor.languageV2 }
        : null,
    };
  }).filter((item) => item.voiceActor);

  return {
    anime: {
      info: {
        ...card,
        stats: {
          rating: media.averageScore ? `${media.averageScore}%` : null,
          episodes: card.episodes,
          type: formatLabel(media.format),
          duration: media.duration ? `${media.duration} min` : null,
          quality: "HD",
        },
        promotionalVideos: media.trailer?.id
          ? [{ title: "Official Trailer", source: `https://www.youtube.com/watch?v=${media.trailer.id}`, thumbnail: media.trailer.thumbnail }]
          : [],
        charactersVoiceActors,
      },
      moreInfo: {
        studios,
        producers: studios,
        genres: media.genres || [],
        status: media.status,
        aired: media.startDate,
        source: media.source,
        synonyms: media.synonyms || [],
      },
    },
    seasons: [],
    relatedAnimes,
    recommendedAnimes,
  };
}

export async function getAnimeEpisodes(id) {
  const animeId = Number(id);
  if (!Number.isInteger(animeId)) throw new Error("AniList anime ID must be numeric");
  const query = `query EpisodeCount($id: Int!) { Media(id: $id, type: ANIME) { id episodes nextAiringEpisode { episode } } }`;
  const data = await queryAniList(query, { id: animeId }, `episodes:${animeId}`);
  const totalEpisodes = releasedEpisodes(data.Media) || data.Media?.episodes || 0;
  return {
    totalEpisodes,
    episodes: Array.from({ length: totalEpisodes }, (_, index) => ({
      number: index + 1,
      title: `Episode ${index + 1}`,
      episodeId: `anilist-${animeId}-episode-${index + 1}`,
      isFiller: false,
    })),
  };
}

export { ANILIST_API_URL };
