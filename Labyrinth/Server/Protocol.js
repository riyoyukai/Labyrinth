/********************************************
* Class: Should match Protocol.as
* Description: Consistent int values of packets
*********************************************/
exports.Protocol = {
	////////////// CLIENT:
	SERVER_IP:0,
	HOST_LOBBY:1,
	JOIN_LOBBY:2,
	LEAVE_LOBBY:3,
	START_GAME:4,
	INPUT:5,
	////////////// SERVER:
	BROADCAST_LOBBY_LIST: 6,
	DENIED: 7,
	JOIN_ACCEPT: 8,
	BROADCAST_LOBBY_STATE: 9,
	START_ACCEPT: 10,
	//TIME_LEFT: 11,
	WORLDSTATE_PLAYERINFO: 12,
	WORLDSTATE_PLAYERATTACKINFO: 13,
	WORLDSTATE_SPAWNERINFO: 14,
	WORLDSTATE_ENEMYINFO: 15,
	WORLDSTATE_PICKUPINFO: 16,
	GAMEOVER: 17,
	ADD_ENEMY:18,
	REMOVE_ENEMY:19,
	PLAY_ATTACK:20,
	ADD_PICKUP:21,
	REMOVE_PICKUP:22,
	STAT_UPDATE:23,

	LOBBY_STATE:24, // server, move up later
	KILL_PLAYER:25,
	ATTACK:26
};