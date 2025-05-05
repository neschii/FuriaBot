// backend/src/utils/pandaScoreApi.js

const axios = require('axios');

const PANDASCORE_BASE_URL = 'https://api.pandascore.co';

const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

// Assuming 124530 is the correct ID for FURIA CS:GO team
const FURIA_CSGO_TEAM_ID = 124530;

const pandascore = axios.create({
  baseURL: PANDASCORE_BASE_URL,
  headers: {
    'Authorization': `Bearer ${PANDASCORE_API_KEY}`
  }
});

async function getFuriaMatches() {
  try {
    // Fetch upcoming CS:GO matches for FURIA using filter[opponent_id] (as this worked)
    const csgoUpcomingResponse = await pandascore.get('/csgo/matches/upcoming', {
      params: {
        'filter[opponent_id]': FURIA_CSGO_TEAM_ID,
        'sort': 'begin_at', // Sort upcoming by soonest first
        'page[size]': 5 // Get up to 5 upcoming matches
      },
    });

    // Fetch recent results (past CS:GO matches) for FURIA
    // Using the original 'opponent' + 'type' structure which didn't cause param errors
    // Combined with sort and increased page size, and adding client-side filter in formatMatchData
    const csgoPastResponse = await pandascore.get('/csgo/matches/past', {
      params: {
        "opponent": { // Original structure
          "id": FURIA_CSGO_TEAM_ID,
          "location": "BR",
          "name": "FURIA",
          "slug": "furia",
        },
        "type": "Team", // Original structure
        'sort': '-begin_at', // Sort past by most recent first
        'page[size]': 50 // Increased page size significantly to try and capture recent matches even if filtering is loose
      },
    });

    // Return structure only includes CS:GO
    return {
      upcoming: {
        csgo: formatMatchData(csgoUpcomingResponse.data),
      },
      past: {
        // Format and then take the top 5 most recent valid matches
        csgo: formatMatchData(csgoPastResponse.data).slice(0, 5), 
      }
    };
  } catch (error) {
    console.error('Error fetching FURIA CS:GO matches:', error.response?.data || error.message);
    // Rethrow the error so the calling function knows it failed
    throw error;
  }
}

async function getLiveMatches() {
  try {
    // Fetch running CS:GO matches using filter[opponent_id] (as this worked)
    const csgoLiveResponse = await pandascore.get('/csgo/matches/running', {
      params: {
         'filter[opponent_id]': FURIA_CSGO_TEAM_ID, // Filtering by opponent_id directly
         'sort': '-begin_at', // Sort live by most recent/currently playing first
         'page[size]': 5 // Get up to 5 live matches
      }
    });

    // Return structure only includes CS:GO
    return {
      csgo: formatMatchData(csgoLiveResponse.data),
      // Removed valorant
    };
  } catch (error) {
    console.error('Error fetching live CS:GO matches:', error.response?.data || error.message);
     // Rethrow the error
    throw error;
  }
}

// formatMatchData filters for the correct team and formats the data
function formatMatchData(matches) {
   if (!matches || matches.length === 0) {
    return [];
  }

  // ADDED CLIENT-SIDE FILTER: Keep only matches where FURIA_CSGO_TEAM_ID is one of the opponents
  const filteredMatches = matches.filter(match => 
    match.opponents && match.opponents.some(opponentData => 
      opponentData.opponent?.id === FURIA_CSGO_TEAM_ID
    )
  );


  return filteredMatches.map(match => { // Map the filtered matches
    const opponents = match.opponents || [];
    const results = match.results || [];

    // Find FURIA by ID (most reliable)
    const furiaOpponentData = opponents.find(opponentData =>
        opponentData.opponent?.id === FURIA_CSGO_TEAM_ID
    );

    // Find the other opponent
    const otherOpponentData = opponents.find(opponentData => 
      opponentData !== furiaOpponentData && opponentData.opponent // Ensure opponent exists
    );

    // Use found data, default if not found (shouldn't happen after filter, but defensive)
    const furiaTeam = furiaOpponentData?.opponent ? {
      id: furiaOpponentData.opponent.id,
      name: furiaOpponentData.opponent.name,
      image: furiaOpponentData.opponent.image_url
    } : { id: null, name: 'FURIA', image: null };

    const opposingTeam = otherOpponentData?.opponent ? {
      id: otherOpponentData.opponent.id,
      name: otherOpponentData.opponent.name,
      image: otherOpponentData.opponent.image_url
    } : { id: null, name: 'TBD', image: null };

    const matchDate = new Date(match.begin_at);
    // Format includes date and time as requested
    const formattedDate = match.begin_at ? matchDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Date TBD'; // Still show 'Date TBD' if begin_at is null

    // Find scores based on team ID
    const furiaResult = results.find(r => r.team_id === furiaTeam.id);
    const opponentResult = results.find(r => r.team_id === opposingTeam.id);

    // Use undefined if result not found
    const furiaScore = furiaResult?.score ?? undefined;
    const opponentScore = opponentResult?.score ?? undefined;

    return {
      id: match.id,
      game: match.videogame?.name || 'CS:GO', // Default to CS:GO now
      status: match.status || 'unknown',
      tournament: {
        name: `${match.league?.name || 'Unknown League'} - ${match.tournament?.name || 'Unknown Tournament'}`,
        image: match.league?.image_url || null
      },
      teams: {
        furia: furiaTeam,
        opponent: opposingTeam
      },
      score: {
        furia: furiaScore,
        opponent: opponentScore
      },
      detailed_stats_available: match.detailed_stats || false,
      date: formattedDate, // Formatted date string
      stream_url: match.official_stream_url || match.streams?.official?.raw_url || match.live_url || null,
      match_url: match.live_url || null // Consider using match.public_url if available/preferred
    };
  });
}


module.exports = {
  getFuriaMatches,
  getLiveMatches,
  formatMatchData, 
};