
// /rgs/engine.ts

import { GameState } from './schema';
import * as jaldi5 from './rules/jaldi5';

export function runGameLogic(game: GameState) {
  let didWin = false;
  let prize = 0;

  switch (game.gameType) {
    case 'jaldi5':
      didWin = jaldi5.checkWin(game.ticket, game.drawNumbers);
      prize = didWin
        ? jaldi5.calculatePrize(100, game.modifiers?.rtpBoost || 1)
        : 0;
      break;

    default:
      throw new Error(`Unsupported game type: ${game.gameType}`);
  }

  return {
    gameId: game.gameId,
    playerId: game.playerId,
    didWin,
    prize,
    evaluatedAt: Date.now(),
  };
}
