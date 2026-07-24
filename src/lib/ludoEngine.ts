import {
  PlayerColor,
  Token,
  GameState,
  MoveOption,
  Player,
  COLOR_ORDER,
  GameLog,
} from '../types/ludo';

// 15x15 Main Track 52 Coordinates (x, y)
export const MAIN_TRACK_COORDS: Array<{ x: number; y: number }> = [
  { x: 1, y: 6 },  // 0  Red Start [SAFE]
  { x: 2, y: 6 },  // 1
  { x: 3, y: 6 },  // 2
  { x: 4, y: 6 },  // 3
  { x: 5, y: 6 },  // 4
  { x: 6, y: 5 },  // 5
  { x: 6, y: 4 },  // 6
  { x: 6, y: 3 },  // 7
  { x: 6, y: 2 },  // 8  [SAFE STAR]
  { x: 6, y: 1 },  // 9
  { x: 6, y: 0 },  // 10
  { x: 7, y: 0 },  // 11
  { x: 8, y: 0 },  // 12
  { x: 8, y: 1 },  // 13 Green Start [SAFE]
  { x: 8, y: 2 },  // 14
  { x: 8, y: 3 },  // 15
  { x: 8, y: 4 },  // 16
  { x: 8, y: 5 },  // 17
  { x: 9, y: 6 },  // 18
  { x: 10, y: 6 }, // 19
  { x: 11, y: 6 }, // 20
  { x: 12, y: 6 }, // 21 [SAFE STAR]
  { x: 13, y: 6 }, // 22
  { x: 14, y: 6 }, // 23
  { x: 14, y: 7 }, // 24
  { x: 14, y: 8 }, // 25
  { x: 13, y: 8 }, // 26 Yellow Start [SAFE]
  { x: 12, y: 8 }, // 27
  { x: 11, y: 8 }, // 28
  { x: 10, y: 8 }, // 29
  { x: 9, y: 8 },  // 30
  { x: 8, y: 9 },  // 31
  { x: 8, y: 10 }, // 32
  { x: 8, y: 11 }, // 33
  { x: 8, y: 12 }, // 34 [SAFE STAR]
  { x: 8, y: 13 }, // 35
  { x: 8, y: 14 }, // 36
  { x: 7, y: 14 }, // 37
  { x: 6, y: 14 }, // 38
  { x: 6, y: 13 }, // 39 Blue Start [SAFE]
  { x: 6, y: 12 }, // 40
  { x: 6, y: 11 }, // 41
  { x: 6, y: 10 }, // 42
  { x: 6, y: 9 },  // 43
  { x: 5, y: 8 },  // 44
  { x: 4, y: 8 },  // 45
  { x: 3, y: 8 },  // 46
  { x: 2, y: 8 },  // 47 [SAFE STAR]
  { x: 1, y: 8 },  // 48
  { x: 0, y: 8 },  // 49
  { x: 0, y: 7 },  // 50
  { x: 0, y: 6 },  // 51
];

export const SAFE_TRACK_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const COLOR_START_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const HOME_STRETCH_COORDS: Record<PlayerColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
  ],
  green: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
  ],
  yellow: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
  ],
  blue: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
  ],
};

export const GOAL_COORDS: Record<PlayerColor, { x: number; y: number }> = {
  red: { x: 6, y: 7 },
  green: { x: 7, y: 6 },
  yellow: { x: 8, y: 7 },
  blue: { x: 7, y: 8 },
};

export const BASE_YARD_COORDS: Record<PlayerColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 1.5, y: 1.5 },
    { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 },
    { x: 3.5, y: 3.5 },
  ],
  green: [
    { x: 10.5, y: 1.5 },
    { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 },
    { x: 12.5, y: 3.5 },
  ],
  yellow: [
    { x: 10.5, y: 10.5 },
    { x: 12.5, y: 10.5 },
    { x: 10.5, y: 12.5 },
    { x: 12.5, y: 12.5 },
  ],
  blue: [
    { x: 1.5, y: 10.5 },
    { x: 3.5, y: 10.5 },
    { x: 1.5, y: 12.5 },
    { x: 3.5, y: 12.5 },
  ],
};

/** Convert token step to global 15x15 board coordinate */
export function getTokenCoordinate(color: PlayerColor, step: number, tokenId: number): { x: number; y: number } {
  if (step === -1) {
    // In Home Base Yard
    return BASE_YARD_COORDS[color][tokenId];
  }

  if (step >= 0 && step <= 50) {
    // On 52-tile Main Track
    const globalIdx = (step + COLOR_START_OFFSETS[color]) % 52;
    return MAIN_TRACK_COORDS[globalIdx];
  }

  if (step >= 51 && step <= 55) {
    // On Home Stretch
    const stretchIdx = step - 51;
    return HOME_STRETCH_COORDS[color][stretchIdx];
  }

  // Step 56 = Finished in Goal Triangle
  return GOAL_COORDS[color];
}

/** Get global track index for a token if on main track */
export function getGlobalTrackIndex(color: PlayerColor, step: number): number | null {
  if (step >= 0 && step <= 50) {
    return (step + COLOR_START_OFFSETS[color]) % 52;
  }
  return null;
}

/** Generate initial fresh game state */
export function createInitialGameState(maxPlayers: number, playersList: Player[]): GameState {
  const activeColors: PlayerColor[] = 
    maxPlayers === 2
      ? ['red', 'yellow'] // Opposite colors for 2-player
      : maxPlayers === 3
      ? ['red', 'green', 'yellow']
      : ['red', 'green', 'yellow', 'blue'];

  // Map players to active colors
  const players: Player[] = activeColors.map((color, idx) => {
    const existing = playersList[idx];
    if (existing) {
      return { ...existing, color };
    }
    return {
      id: `bot-${color}`,
      nickname: `Bot ${color.toUpperCase()}`,
      color,
      isHost: false,
      isBot: true,
      isConnected: true,
    };
  });

  const tokens: Record<PlayerColor, Token[]> = {
    red: [0, 1, 2, 3].map((id) => ({ id, color: 'red', step: -1 })),
    green: [0, 1, 2, 3].map((id) => ({ id, color: 'green', step: -1 })),
    yellow: [0, 1, 2, 3].map((id) => ({ id, color: 'yellow', step: -1 })),
    blue: [0, 1, 2, 3].map((id) => ({ id, color: 'blue', step: -1 })),
  };

  return {
    status: 'playing',
    maxPlayers,
    currentTurn: activeColors[0],
    players,
    tokens,
    dice: {
      value: null,
      isRolling: false,
      rolledByColor: null,
      hasMovedThisTurn: false,
      consecutiveSixes: 0,
    },
    winnerOrder: [],
    logs: [
      {
        id: `log-${Date.now()}-init`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Game started with ${players.length} players! ${players[0].nickname} (${players[0].color.toUpperCase()}) goes first.`,
        type: 'system',
      },
    ],
    lastActionAt: Date.now(),
  };
}

/** Get valid moves for current player given rolled dice value */
export function getValidMoves(state: GameState): MoveOption[] {
  const { currentTurn, dice, tokens } = state;
  if (!dice.value || dice.hasMovedThisTurn) return [];

  const playerTokens = tokens[currentTurn];
  const diceVal = dice.value;
  const moves: MoveOption[] = [];

  playerTokens.forEach((t) => {
    // 1. Token in base yard (step -1)
    if (t.step === -1) {
      if (diceVal === 6) {
        moves.push({
          tokenId: t.id,
          color: currentTurn,
          fromStep: -1,
          toStep: 0,
        });
      }
    } else if (t.step < 56) {
      // 2. Token on track or home stretch
      const targetStep = t.step + diceVal;
      if (targetStep <= 56) {
        const isFinish = targetStep === 56;
        let isCapture = false;

        // Check potential capture if target is on main track
        if (targetStep <= 50) {
          const targetGlobalIdx = (targetStep + COLOR_START_OFFSETS[currentTurn]) % 52;
          const isSafeSquare = SAFE_TRACK_INDICES.includes(targetGlobalIdx);

          if (!isSafeSquare) {
            // Check if opponent tokens occupy this square
            for (const color of COLOR_ORDER) {
              if (color !== currentTurn) {
                const oppTokens = tokens[color];
                for (const oppT of oppTokens) {
                  if (getGlobalTrackIndex(color, oppT.step) === targetGlobalIdx) {
                    isCapture = true;
                    break;
                  }
                }
              }
              if (isCapture) break;
            }
          }
        }

        moves.push({
          tokenId: t.id,
          color: currentTurn,
          fromStep: t.step,
          toStep: targetStep,
          isCapture,
          isFinish,
        });
      }
    }
  });

  return moves;
}

/** Get next active turn color in clockwise order */
export function getNextTurnColor(state: GameState, currentColor: PlayerColor): PlayerColor {
  const activePlayers = state.players.filter((p) => !p.hasFinished);
  if (activePlayers.length === 0) return currentColor;

  const activeColors = state.players.map((p) => p.color);
  const currentIdx = activeColors.indexOf(currentColor);

  for (let i = 1; i <= activeColors.length; i++) {
    const nextIdx = (currentIdx + i) % activeColors.length;
    const nextColor = activeColors[nextIdx];
    const player = state.players.find((p) => p.color === nextColor);
    if (player && !player.hasFinished) {
      return nextColor;
    }
  }

  return currentColor;
}

/** Execute token move and return updated game state */
export function applyTokenMove(state: GameState, tokenId: number): GameState {
  const validMoves = getValidMoves(state);
  const move = validMoves.find((m) => m.tokenId === tokenId);

  if (!move) return state; // Invalid move attempt

  const { currentTurn, tokens, players, dice, winnerOrder, logs } = state;
  const newTokens = { ...tokens, [currentTurn]: tokens[currentTurn].map((t) => ({ ...t })) };
  const targetToken = newTokens[currentTurn].find((t) => t.id === tokenId)!;

  targetToken.step = move.toStep;

  let extraTurn = dice.value === 6;
  let captureHappened = false;
  let finishedHappened = false;

  const newLogs: GameLog[] = [...logs];
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Check for Capture
  if (move.toStep <= 50) {
    const targetGlobalIdx = getGlobalTrackIndex(currentTurn, move.toStep);
    if (targetGlobalIdx !== null && !SAFE_TRACK_INDICES.includes(targetGlobalIdx)) {
      COLOR_ORDER.forEach((oppColor) => {
        if (oppColor !== currentTurn) {
          const oppTokens = newTokens[oppColor] ? [...newTokens[oppColor]] : [];
          let colorCaptured = false;

          newTokens[oppColor] = oppTokens.map((oppT) => {
            if (getGlobalTrackIndex(oppColor, oppT.step) === targetGlobalIdx) {
              colorCaptured = true;
              captureHappened = true;
              return { ...oppT, step: -1 }; // Send back to home base
            }
            return oppT;
          });

          if (colorCaptured) {
            const oppPlayer = players.find((p) => p.color === oppColor);
            const currPlayer = players.find((p) => p.color === currentTurn);
            newLogs.push({
              id: `log-${Date.now()}-cap`,
              timestamp: nowStr,
              text: `⚔️ ${currPlayer?.nickname || currentTurn} captured ${oppPlayer?.nickname || oppColor}'s token! Extra turn granted!`,
              type: 'capture',
              color: currentTurn,
            });
          }
        }
      });
    }
  }

  if (captureHappened) {
    extraTurn = true;
  }

  // 2. Check if Token Reached Home Goal (step 56)
  if (move.toStep === 56) {
    finishedHappened = true;
    extraTurn = true;
    const currPlayer = players.find((p) => p.color === currentTurn);
    newLogs.push({
      id: `log-${Date.now()}-goal`,
      timestamp: nowStr,
      text: `🌟 ${currPlayer?.nickname || currentTurn} brought a token HOME! Extra turn granted!`,
      type: 'move',
      color: currentTurn,
    });
  } else if (!captureHappened) {
    const currPlayer = players.find((p) => p.color === currentTurn);
    newLogs.push({
      id: `log-${Date.now()}-move`,
      timestamp: nowStr,
      text: `${currPlayer?.nickname || currentTurn} moved Token #${tokenId + 1} (${move.fromStep === -1 ? 'Out of Base' : `${move.fromStep} ➔ ${move.toStep}`})`,
      type: 'move',
      color: currentTurn,
    });
  }

  // 3. Check if current player completed all 4 tokens
  const allHome = newTokens[currentTurn].every((t) => t.step === 56);
  let updatedPlayers = [...players];
  let updatedWinners = [...winnerOrder];

  if (allHome && !updatedWinners.includes(currentTurn)) {
    updatedWinners.push(currentTurn);
    const rank = updatedWinners.length;
    updatedPlayers = updatedPlayers.map((p) =>
      p.color === currentTurn ? { ...p, hasFinished: true, finishRank: rank } : p
    );

    const currPlayer = players.find((p) => p.color === currentTurn);
    newLogs.push({
      id: `log-${Date.now()}-win`,
      timestamp: nowStr,
      text: `🏆 ${currPlayer?.nickname || currentTurn} FINISHED ALL TOKENS! (Rank #${rank})`,
      type: 'win',
      color: currentTurn,
    });
  }

  // Check game over (if only 1 player remains)
  const unfinishedPlayers = updatedPlayers.filter((p) => !p.hasFinished);
  const isGameOver = unfinishedPlayers.length <= 1;

  let nextTurn = currentTurn;
  if (!extraTurn || isGameOver) {
    nextTurn = getNextTurnColor({ ...state, players: updatedPlayers }, currentTurn);
  }

  return {
    ...state,
    status: isGameOver ? 'finished' : 'playing',
    players: updatedPlayers,
    tokens: newTokens,
    winnerOrder: updatedWinners,
    currentTurn: nextTurn,
    dice: {
      value: null,
      isRolling: false,
      rolledByColor: null,
      hasMovedThisTurn: false,
      consecutiveSixes: extraTurn && dice.value === 6 ? dice.consecutiveSixes : 0,
    },
    logs: newLogs,
    lastActionAt: Date.now(),
  };
}

/** Roll dice for current player and update state */
export function rollDiceForTurn(state: GameState, rolledValue?: number): { newState: GameState; validMoves: MoveOption[] } {
  if (state.dice.isRolling || state.dice.value !== null) {
    return { newState: state, validMoves: [] };
  }

  const val = rolledValue || Math.floor(Math.random() * 6) + 1;
  const isSix = val === 6;
  const consecutiveSixes = isSix ? state.dice.consecutiveSixes + 1 : 0;
  const currPlayer = state.players.find((p) => p.color === state.currentTurn);
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Forfeit if 3 consecutive sixes
  if (consecutiveSixes === 3) {
    const nextTurn = getNextTurnColor(state, state.currentTurn);
    const forfeitedLogs: GameLog[] = [
      ...state.logs,
      {
        id: `log-${Date.now()}-666`,
        timestamp: nowStr,
        text: `⚠️ ${currPlayer?.nickname || state.currentTurn} rolled three 6s in a row! Turn forfeited!`,
        type: 'roll',
        color: state.currentTurn,
      },
    ];

    const forfeitedState: GameState = {
      ...state,
      currentTurn: nextTurn,
      dice: {
        value: null,
        isRolling: false,
        rolledByColor: null,
        hasMovedThisTurn: false,
        consecutiveSixes: 0,
      },
      logs: forfeitedLogs,
      lastActionAt: Date.now(),
    };

    return { newState: forfeitedState, validMoves: [] };
  }

  const updatedDiceState = {
    value: val,
    isRolling: false,
    rolledByColor: state.currentTurn,
    hasMovedThisTurn: false,
    consecutiveSixes,
  };

  const tempState: GameState = {
    ...state,
    dice: updatedDiceState,
  };

  const validMoves = getValidMoves(tempState);

  const rollLog: GameLog = {
    id: `log-${Date.now()}-roll`,
    timestamp: nowStr,
    text: `🎲 ${currPlayer?.nickname || state.currentTurn} rolled a ${val}! ${
      validMoves.length === 0 ? '(No valid moves - passing turn)' : ''
    }`,
    type: 'roll',
    color: state.currentTurn,
  };

  let finalState: GameState = {
    ...tempState,
    logs: [...state.logs, rollLog],
    lastActionAt: Date.now(),
  };

  // If NO valid moves exist for this roll, automatically end turn!
  if (validMoves.length === 0) {
    const nextTurn = getNextTurnColor(state, state.currentTurn);
    finalState = {
      ...finalState,
      currentTurn: isSix ? state.currentTurn : nextTurn, // If six but no move, give another roll or pass if blocked
      dice: {
        value: null,
        isRolling: false,
        rolledByColor: null,
        hasMovedThisTurn: false,
        consecutiveSixes: isSix ? consecutiveSixes : 0,
      },
    };
  }

  return { newState: finalState, validMoves };
}
