from pydantic import BaseModel
from typing import Dict, Optional, Literal
import uuid

PlayerId = str
RoomId = str

class CreateRoom(BaseModel):
    game: Literal["snl"] = "snl"
    seed: Optional[int] = None

class JoinRoom(BaseModel):
    player_name: str

class RollRequest(BaseModel):
    player_id: PlayerId

class RoomInfo(BaseModel):
    room_id: RoomId
    game: str
    players: Dict[PlayerId, str]
    state: Dict

def new_id() -> str:
    return uuid.uuid4().hex
