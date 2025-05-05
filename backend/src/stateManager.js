const sessions = new Map(); // Map<sessionId, { state: string, data: any }>

const initialState = {
  state: 'main_menu',
  data: {} // To store quiz progress, selected game, etc.
};

// Define possible states (optional, but helpful)
const states = [
    'main_menu',
    'games_menu', // State for the game selection sub-menu
    'awaiting_game_action', // State after selecting a game, waiting for upcoming/live/latest choice
    'awaiting_return', // Waiting for user to click 'Return to Main Menu' (from non-game specific info)
    'awaiting_games_return', // Waiting for user to click 'Return to Games Menu' or 'Main Menu' (from game-specific info)
    'waiting_for_qa_question',
    'in_quiz',
    // Add other states if needed
];


function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { ...initialState });
    console.log(`New session created: ${sessionId}`);
  }
  return sessions.get(sessionId);
}

function updateSession(sessionId, newState, newData = {}) {
  const session = getSession(sessionId);
  // Optional: Validate newState against defined states
  // if (states.includes(newState)) { // Commenting out validation for flexibility
      session.state = newState;
      session.data = { ...session.data, ...newData };
      console.log(`Session ${sessionId} updated. State: ${session.state}`);
  // } else {
  //     console.error(`Attempted to set unknown state for session ${sessionId}: ${newState}`);
  //      // Optionally revert to a safe state or throw error
  //      // For now, just log and don't change state
  // }
}

function resetSession(sessionId) {
    sessions.set(sessionId, { ...initialState });
    console.log(`Session ${sessionId} reset.`);
}


module.exports = {
  getSession,
  updateSession,
  resetSession
};