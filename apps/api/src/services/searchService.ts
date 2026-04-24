import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

export class SearchService {
  static async indexTrack(track: any) {
    return esClient.index({
      index: 'tracks',
      id: track.id,
      document: {
        title: track.title,
        artistName: track.artistName,
        albumTitle: track.albumTitle,
        genre: track.genre,
        releaseDate: track.releaseDate,
        isExplicit: track.isExplicit,
        cover: track.cover || track.coverUrl,
      },
    });
  }

  static async searchTracks(query: string, genre?: string) {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'artistName^2', 'albumTitle', 'genre'],
          fuzziness: 'AUTO',
        },
      }
    ];

    if (genre) {
      must.push({ match: { genre: { query: genre, operator: 'and' } } });
    }

    const result = await esClient.search({
      index: 'tracks',
      query: {
        bool: {
          must,
        },
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }));
  }

  static async indexArtist(artist: any) {
    return esClient.index({
      index: 'artists',
      id: artist.id,
      document: {
        name: artist.name,
        bio: artist.bio,
        isVerified: artist.isVerified,
      },
    });
  }

  static async searchGlobal(query: string) {
    const result = await esClient.search({
      index: ['tracks', 'artists'],
      query: {
        multi_match: {
          query,
          fields: ['title', 'artistName', 'name', 'albumTitle'],
          fuzziness: 'AUTO',
        },
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      type: hit._index,
      ...hit._source,
    }));
  }

  static async getSuggestions(query: string) {
    const result = await esClient.search({
      index: 'tracks',
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                title: {
                  query,
                  boost: 5
                }
              }
            },
            {
              match: {
                artistName: {
                  query,
                  boost: 2
                }
              }
            }
          ]
        }
      },
      size: 5
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      title: hit._source.title,
      artistName: hit._source.artistName,
      cover: hit._source.cover,
      type: 'track'
    }));
  }
}
