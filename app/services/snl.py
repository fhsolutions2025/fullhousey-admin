import random
from typing import Dict, List

DEFAULT_SNAKES = {16:6, 47:26, 49:11, 56:53, 62:19, 64:60, 87:24, 93:73, 95:75, 98:78}
DEFAULT_LADDERS = {1:38, 4:14, 9:31, 21:42, 28:84, 36:44, 51:67, 71:91, 80:100}

class SNLGame:
    def __init__(self, seed=None, snakes=None, ladders=None):
        self.snakes = snakes or DEFAULT_SNAKES
        self.ladders = ladders or DEFAULT_LADDERS
        self.positions: Dict[str, int] = {}
        self.turn_order: List[str] = []
        self.current_idx = 0
        self.random = random.Random(seed)
        self.winner: str | None = None

    def join(self, player_id: str):
        if player_id in self.positions:
            return
        self.positions[player_id] = 0
        self.turn_order.append(player_id)

    def state(self) -> Dict:
        return {
            "positions": self.positions,
            "turn": self.turn_order[self.current_idx] if self.turn_order else None,
            "snakes": self.snakes,
            "ladders": self.ladders,
            "winner": self.winner,
        }

    def roll(self, player_id: str) -> Dict:
        assert self.turn_order and self.turn_order[self.current_idx] == player_id, "Not your turn"
        if self.winner:
            return {"dice": None, "moved_to": None, "note": "game_over", "winner": self.winner}

        dice = self.random.randint(1,6)
        pos = self.positions[player_id]
        if pos + dice <= 100:
            pos += dice
            if pos in self.snakes:
                pos = self.snakes[pos]
            elif pos in self.ladders:
                pos = self.ladders[pos]
        self.positions[player_id] = pos

        if pos == 100:
            self.winner = player_id

        if dice != 6 or self.winner:
            self.current_idx = (self.current_idx + 1) % len(self.turn_order)

        return {"dice": dice, "moved_to": pos, "winner": self.winner}
