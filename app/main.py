from fastapi import FastAPI, HTTPException
from typing import Dict
from .models import CreateRoom, JoinRoom, RollRequest, RoomInfo, new_id
from .services.snl import SNLGame

app = FastAPI(title="Snakes & Ladders API", version="1.0.0")

class RoomStore:
    def __init__(self):
        self.rooms: Dict[str, Dict] = {}

    def create(self, seed=None):
        room_id = new_id()
        game_obj = SNLGame(seed=seed)
        self.rooms[room_id] = {"game": "snl", "engine": game_obj, "players": {}}
        return room_id

    def get(self, room_id: str):
        if room_id not in self.rooms:
            raise KeyError("room not found")
        return self.rooms[room_id]

    def delete(self, room_id: str):
        self.rooms.pop(room_id, None)

STORE = RoomStore()

@app.post("/v1/rooms", response_model=RoomInfo)
def create_room(payload: CreateRoom):
    room_id = STORE.create(payload.seed)
    room = STORE.get(room_id)
    return RoomInfo(room_id=room_id, game=room["game"], players=room["players"], state=room["engine"].state())

@app.post("/v1/rooms/{room_id}/join", response_model=RoomInfo)
def join_room(room_id: str, payload: JoinRoom):
    try:
        room = STORE.get(room_id)
    except KeyError:
        raise HTTPException(404, "room not found")
    player_id = new_id()
    room["players"][player_id] = payload.player_name
    room["engine"].join(player_id)
    return RoomInfo(room_id=room_id, game=room["game"], players=room["players"], state=room["engine"].state())

@app.get("/v1/rooms/{room_id}", response_model=RoomInfo)
def get_room(room_id: str):
    try:
        room = STORE.get(room_id)
    except KeyError:
        raise HTTPException(404, "room not found")
    return RoomInfo(room_id=room_id, game=room["game"], players=room["players"], state=room["engine"].state())

@app.post("/v1/snl/{room_id}/roll")
def snl_roll(room_id: str, payload: RollRequest):
    room = STORE.get(room_id)
    try:
        res = room["engine"].roll(payload.player_id)
    except AssertionError as e:
        raise HTTPException(400, str(e))
    return res

@app.delete("/v1/rooms/{room_id}")
def delete_room(room_id: str):
    STORE.delete(room_id)
    return {"ok": True}
