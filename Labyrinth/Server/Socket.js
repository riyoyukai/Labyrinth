
var dgram = require("dgram");
var Protocol = require("./Protocol.js").Protocol;
var Game = require("./Game.js").Game;

/********************************************
* Class: Socket
* Description: UDP/datagram Socket 
* Handles all 
*********************************************/
exports.Socket = function(){
	var me = this;
	this.socket = dgram.createSocket("udp4");
	this.socket.on("message", function(buff, rinfo){

		var type = buff.readUInt8(0);

		var player = global.Labyrinth.players.GetByAddr(rinfo);

		//console.log("Received message from " + rinfo.address + ":" + rinfo.port);

		if(player == null) { // player wasn't in collection yet
			if(type == Protocol.HOST_LOBBY || type == Protocol.JOIN_LOBBY){ // if it was a join request, add them
				player = global.Labyrinth.players.Add(rinfo);
				player.Refresh();
			}
		}

		switch(type){
			/********************************************
			* Case: HOST_LOBBY
			*********************************************/
			case Protocol.HOST_LOBBY:
				if(!player.hosting){
					//console.log("sending host accept");
					var roomID = ++global.Labyrinth.roomID;
					player.roomID = roomID;
					console.log("Player " + player.rinfo.address + " created room " + roomID);
					player.hosting = true;
					global.Labyrinth.gamelist.push(new Game(roomID));
					global.Labyrinth.joinableGames++;
					var gameInstance = global.Labyrinth.gamelist[roomID];
					gameInstance.AddPlayer(player, 0);
					me.SendJoinAccept(player, roomID, 0);
					me.SendLobbyState(gameInstance);
				}else{
					// server thought this player was hosting already but they sent another host request
					global.Labyrinth.gamelist[player.roomID].Dispose();
					global.Labyrinth.gamelist[player.roomID] = null;
					global.Labyrinth.joinableGames--;
					player.roomID = null;
					player.hosting = false;
				}
				break;

			/********************************************
			* Case: JOIN_LOBBY
			*********************************************/
			case Protocol.JOIN_LOBBY:
				var roomID = buff.readUInt8(1); // the ID of the room requested to join
				var gameInstance = global.Labyrinth.gamelist[roomID];
				var emptyIndex = -1;
				var newPlayer = false;

				// currently, 1 is the first valid room number
				if(player.roomID == null || player.roomID <= 0){
					// player was not in a room yet
					newPlayer = true;
				}else if(player.roomID != roomID){
					// player was in a different room, and we missed a leave request
					var oldGameInstance = global.Labyrinth.gamelist[player.roomID];
					if(oldGameInstance != null){
						oldGameInstance.RemovePlayer(player);
						me.SendLobbyState(oldGameInstance);
					}
					newPlayer = true;
				}

				if(newPlayer){
					player.hosting = false;

					// look for an empty seat
					for(var i = 0; i < gameInstance.players.length; i++){
						if(gameInstance.players[i] == null){
							emptyIndex = i;
							break;
						}
					}

					if(emptyIndex == -1){ 
						// room is full
						me.SendDeny(player);
					}else{
						//found empty seat, add them
						gameInstance.AddPlayer(player, emptyIndex);
						player.roomID = roomID;

						me.SendJoinAccept(player, roomID, emptyIndex);
					}
				}else{
					// player.roomID == roomID
					// this player is already considered to be in this room
					// they probably missed the join packet
					// find what seat they are in and send it again
					var playerSeat = -1;
					for(var i = 0; i < gameInstance.players.length; i++){
						if(playerSeat != -1 || gameInstance.players[i] == null) continue;
						if(gameInstance.players[i].MatchesAddr(player.rinfo)){
							playerSeat = i;
						}
					}

					if(playerSeat == -1){
						console.log("We thought this player was in this game but they're not? Fix this");
					}else{
						if(playerSeat != 0) player.hosting = false;
						me.SendJoinAccept(player, roomID, playerSeat);
					}
				}

				setTimeout(me.SendLobbyState(gameInstance), 500);
				break;

			/********************************************
			* Case: LEAVE_LOBBY
			* Runs when a player tries to leave the lobby
			* If it's the host, kick everyone from that host's game
			* If it's not the host, tell everyone in their old game
			* that they left.
			*********************************************/
			case Protocol.LEAVE_LOBBY:
				if(player.roomID != null){
					var oldGameInstance = global.Labyrinth.gamelist[player.roomID];
					if(oldGameInstance != null){
						oldGameInstance.RemovePlayer(player);
						me.SendLobbyState(oldGameInstance);
					}
				}
				player.roomID = null;
				var roomID = buff.readUInt8(1);
				var gameInstance = global.Labyrinth.gamelist[roomID];
				if(player.hosting){
					me.SendHostLeft(global.Labyrinth.gamelist[roomID].players);
					global.Labyrinth.gamelist[roomID] = null;
					global.Labyrinth.joinableGames--;
					player.hosting = false;
				}else if(gameInstance != null){
					gameInstance.RemovePlayer(player);
					global.Labyrinth.players.RemovePlayer(player);
					me.SendLobbyState(gameInstance);
				}else{
					me.SendDeny(player);
				}
				break;

			/********************************************
			* Case: START_GAME
			* Host wants to start game with given ID
			*********************************************/
			case Protocol.START_GAME:
				var roomID = buff.readUInt8(1);
				var gameInstance = global.Labyrinth.gamelist[roomID];
				if(gameInstance.fullSeats >= 2){
					global.Labyrinth.joinableGames--;
					me.SendLobbyState(gameInstance);

					setTimeout(me.SendStartAccept(roomID), 500);
					setTimeout(global.Labyrinth.Play(roomID), 500);
				}
				break;

			/********************************************
			* Case: INPUT
			* Bitfield of input. See Player.Keys for desc.
			*********************************************/
			case Protocol.INPUT:
				var flags = buff.readUInt8(1);
				var Q = (flags & 64) > 0;
				var W = (flags & 32) > 0;
				var E = (flags & 16) > 0;

				var P = (flags & 8) > 0;
				var J = (flags & 4) > 0;
				var L = (flags & 2) > 0;
				var R = (flags & 1) > 0;

				player.Keys.Update(Q, W, E, P, J, L, R);
				break;

			/********************************************
			* Case: BROADCAST_LOBBY_LIST
			* Server might receive its own broadcasts but
			* I think I fixed this 
			*********************************************/
			case Protocol.BROADCAST_LOBBY_LIST:
				break;

			/********************************************
			* Default: Unknown packet type.
			*********************************************/
			default:
				console.log("received an unkown packet type: "+type);
		}
	});

	/********************************************
	* Runs when the socket starts. Begins updating to broadcast server IP
	*********************************************/
	this.socket.on("listening", function(){
		console.log("Listening on " + global.Config.LOCALIP + ":" + global.Config.SERVERPORT);
		console.log("Now broadcasting server IP and joinable rooms every 4 seconds...");
		me.Update();
	});

	/********************************************
	* Function: Listen
	* Description:	Starts the socket listening.
	* Gets your local IP and guesses at broadcast IP
	*********************************************/
	this.Listen = function(){
		this.socket.bind(global.Config.SERVERPORT);
		/***/

		var os=require('os');
		var ifaces=os.networkInterfaces();
		var found = false;
		console.log("Attempting to determine local IP...");
		for (var dev in ifaces) {
			if(!found){
				ifaces[dev].forEach(function(details){
					console.log(details.family + " : " + dev);
					if (!found && details.family=='IPv4' && (("" + dev).indexOf("Local Area Connection") > -1 || ("" + dev).indexOf("Wireless Network Connection") > -1)){
						global.Config.LOCALIP = details.address;
						global.Config.BROADCASTIP = me.GetBroadcastIP(details.address, "255.255.255.0"); //Assuming the subnet mask is 255.255.255.0
						found = true;
					}
				});
			}
		}
		console.log("Your local IP is " + global.Config.LOCALIP);
		console.log("Your broadcast IP is " + global.Config.BROADCASTIP);

		//var IP = new java.net.InetAddress.getLocalHost();
		//console.log("IP of my system is := "+IP.getHostAddress());
	};

	/********************************************
	* Function: Update
	* Description:	Sends the server IP and lobby list
	* Every 4 seconds
	*********************************************/
	this.Update = function(){
		me.BroadcastServerIP();

		me.BroadcastLobbyList();

		setTimeout(me.Update, 4000);
	};

	/********************************************
	* GetBroadcastIP: 
	* takes 2 string representations of local IP and subnet mask
	* returns broadcast IP as a string
	*********************************************/
	this.GetBroadcastIP = function(ip, mask){
		ip = this.IP4toUInt32(ip);
		mask = this.IP4toUInt32(mask);
		return this.UInt32toIP4(ip | ~mask);
	};

	/********************************************
	* Function: IP4toUInt32
	* Description:	converts string IP4 addresses into a uint32
	*********************************************/
	this.IP4toUInt32 = function(str){
		var parts = str.split(".");
		var total = 0;

		var counter = 3;
		for(var i = 0; i < parts.length; i++){
			parts[i] = parseInt(parts[i]);

			total |= parts[i]<<counter * 8;
			counter--;
		}

		return total;
	};

	/********************************************
	* Function: UInt32toIP4
	* Description:	converts uint32 IP4 addresses into a string
	*********************************************/
	this.UInt32toIP4 = function(i){
		var p4 = i & 255;
		var p3 = (i>>8) & 255;
		var p2 = (i>>16) & 255;
		var p1 = (i>>24) & 255;

		return [p1, p2, p3, p4].join(".");
	};

	/********************************************
	* Function: Send
	* Description:	Sends buffer to the given rinfo address
	*********************************************/
	this.Send = function(buff, rinfo){
		me.socket.send(buff, 0, buff.length, rinfo.port, rinfo.address, function(err, bytes){

		});
	};

	/********************************************
	* Function: SendToPlayers
	* Description:	Sends buffer to all specified players
	*********************************************/
	this.SendToPlayers = function(buff, players){
		for(var i = 0; i < players.length; i++){
			if(players[i] != null){
				me.socket.send(buff, 0, buff.length, players[i].rinfo.port, players[i].rinfo.address, function(err, bytes){

				});
			}
		}
	}

	/********************************************
	* Function: Broadcast
	* Description: Sends buffer to your broadcast IP
	*********************************************/
	this.Broadcast = function(buff){
		var rinfo = {port:global.Config.CLIENTPORT, address:global.Config.BROADCASTIP};
		
		me.socket.send(buff, 0, buff.length, rinfo.port, rinfo.address, function(err, bytes){

		});
	};

//////////////////////////////////// SEND FUNCTIONS

	/**************************************************
	* Packet Type: SERVER_IP
	* Broadcasts a packet so clients can get the server IP
	**************************************************/
	this.BroadcastServerIP = function(){
		var buff = new Buffer(3);
		buff.writeUInt8(Protocol.SERVER_IP, 0);
		me.Broadcast(buff);
	}

	/**************************************************
	* Packet Type: BROADCAST_LOBBY_LIST
	* Number of joinable lobbies
	* 	ID of the lobby
	* 	Number of full seats
	**************************************************/
	this.BroadcastLobbyList = function(){

		var numOpenLobbies = 0;
		for(var i = 0; i < global.Labyrinth.gamelist.length; i++){
			var gameInstance = global.Labyrinth.gamelist[i];
			if(gameInstance != null && gameInstance.fullSeats < 8 && !gameInstance.started){
				numOpenLobbies++;
			}
		}

		var hb = 2; // header bytes; static; same length for every packet
		var vb = 2; // variable bytes; nonstatic; bytes per object in loop
		var len = hb + vb * numOpenLobbies;

		var buff = new Buffer(len);
		buff.writeUInt8(Protocol.BROADCAST_LOBBY_LIST, 0);
		buff.writeUInt8(numOpenLobbies, 1);
		
		var i2 = 0;
		for(var i = 1; i < global.Labyrinth.gamelist.length + 1; i++){
			var gameInstance = global.Labyrinth.gamelist[i];
			if(gameInstance != null && gameInstance.fullSeats < 8 && !gameInstance.started){
				buff.writeUInt8(gameInstance.id, 2 + i2*vb);
				buff.writeUInt8(gameInstance.fullSeats, 3 + i2*vb);
				console.log("Broadcasting game: " + gameInstance.id + ", full seats: " + gameInstance.fullSeats);
				i2++;
			}
		}

		me.Broadcast(buff);
	};

	/**************************************************
	* Packet Type: JOIN_ACCEPT
	* ID of room the player joined
	* ID of the player (0 - 7)
	**************************************************/
	this.SendJoinAccept = function(player, roomID, playerID){
		var buff = new Buffer(3);
		var gameInstance = global.Labyrinth.gamelist[roomID];
		buff.writeUInt8(Protocol.JOIN_ACCEPT, 0);
		buff.writeUInt8(roomID, 1);
		buff.writeUInt8(playerID, 2);
		me.Send(buff, player.rinfo);
	};

	/**************************************************
	* Packet Type: DENIED
	* Sent when a game is full
	**************************************************/
	this.SendDeny = function(player){
		var buff = new Buffer(1);
		buff.writeUInt8(Protocol.DENIED, 0);
		me.Send(buff, player.rinfo);
	};

	/**************************************************
	* Packet Type: DENIED
	* Send when a host leaves; kicks all players in host's room
	**************************************************/
	this.SendHostLeft = function(players){
		for(var i = 0; i < players.length; i++){
			if(players[i] == null) continue;
			if(players[i].hosting) players[i] = null;
		}
		var buff = new Buffer(1);
		buff.writeUInt8(Protocol.DENIED, 0);
		me.SendToPlayers(buff, players);
	};

	/**************************************************
	* Packet Type: DENIED
	* Sent when server starts, in case players are in games.
	**************************************************/
	this.BroadcastKickAll = function(){
		var buff = new Buffer(1);
		buff.writeUInt8(Protocol.DENIED, 0);
		me.Broadcast(buff);
	};

	/**************************************************
	* Packet Type: LOBBY_STATE
	* Bitfield of taken seats (1 for taken, 0 for open)
	**************************************************/
	this.SendLobbyState = function(gameInstance){
		var buff = new Buffer(2);
		var takenSeats = 0;

		// host goes in first, will be on left
		for(var i = 0; i < 8; i++){
			if(gameInstance.players[i] != null) takenSeats ++;
			if(i < 7) takenSeats = takenSeats << 1;
		}

		buff.writeUInt8(Protocol.LOBBY_STATE, 0);
		buff.writeUInt8(takenSeats, 1);
		me.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: START_ACCEPT
	* Tells the players in given room to go to GSPlay
	**************************************************/
	this.SendStartAccept = function(roomID){
		var buff = new Buffer(1);
		buff.writeUInt8(Protocol.START_ACCEPT, 0);
		me.SendToPlayers(buff, global.Labyrinth.gamelist[roomID].players);
	};

	/**************************************************
	* Packet Type: KILL_PLAYER
	* 1 for end game, 0 for keep playing
	* ID of player to kill (0-7)
	* ID of winning player (1-8)
	**************************************************/
	this.SendKillPlayer = function(gameInstance, playerID, winner){

		console.log("WINNER IS: PLAYER " + winner);

		var len = 3;
		var buff = new Buffer(len);

		// header bytes
		buff.writeUInt8(Protocol.KILL_PLAYER, 0);
		buff.writeUInt8(playerID, 1);
		buff.writeUInt8(winner, 2);

		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: WORLDSTATE_PLAYERINFO
	* Number of Players
	*   Player index
	*   worldX
	*   worldY
	**************************************************/
	this.SendWorldstatePlayers = function(gameInstance){

		var numPlayers = gameInstance.fullSeats;
		var hb = 2; // header bytes; static; same length for every packet
		var vb = 9; // variable bytes; nonstatic; bytes per object in loop

		var len = hb + vb * numPlayers;
		var buff = new Buffer(len);

		// header bytes
		buff.writeUInt8(Protocol.WORLDSTATE_PLAYERINFO, 0);
		buff.writeUInt8(numPlayers, 1);

		// variable bytes
		for(var i = 0; i < numPlayers; i++){
			if(gameInstance.players[i] == null) continue;
			buff.writeUInt8(i, 2 + i*vb);
			buff.writeFloatBE(gameInstance.players[i].worldX, 3 + i*vb);
			buff.writeFloatBE(gameInstance.players[i].worldY, 7 + i*vb);

			//console.log("Player " + i + " is at (" + gameInstance.players[i].worldX + ", " + gameInstance.players[i].worldY + ")");
		}

		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: ATTACK
	* index of attacking player
	* attack type
	**************************************************/
	this.SendAttack = function(player, attackType){
		var playerID = -1;
		var gameInstance = global.Labyrinth.gamelist[player.roomID];

		for(var i = 0; i < gameInstance.players.length; i++){
			if(gameInstance.players[i] == null) continue;
			if(gameInstance.players[i].MatchesAddr(player)){
				playerID = i;
			}
		}

		if(playerID != -1){
			var len = 3;
			var buff = new Buffer(len);

			buff.writeUInt8(Protocol.ATTACK, 0);
			buff.writeUInt8(playerID, 1);
			buff.writeUInt8(attackType, 2);

			me.Send(buff, gameInstance.players);
		}
	};

	/**************************************************
	* Packet Type: STAT_UPDATE
	* Current HP
	* Total HP
	* Current Energy
	* Total Energy
	**************************************************/
	this.SendStats = function(player){
		var len = 9;
		var buff = new Buffer(len);

		buff.writeUInt8(Protocol.STAT_UPDATE, 0);
		buff.writeUInt16BE(player.health, 1);
		buff.writeUInt16BE(player.maxHealth, 3);
		buff.writeUInt16BE(player.energy, 5);
		buff.writeUInt16BE(player.maxEnergy, 7);

		me.Send(buff, player.rinfo);
	};

	/**************************************************
	* Packet Type: ADD_ENEMY
	* Enemy Type
	**************************************************/
	this.SendAddEnemy = function(gameInstance, eType){
		var len = 2;
		var buff = new Buffer(len);

		buff.writeUInt8(Protocol.ADD_ENEMY, 0);
		buff.writeUInt8(eType, 1);
		this.SendToPlayers(buff, gameInstance.players);
	};


	/**************************************************
	* Packet Type: REMOVE_ENEMY
	* Enemy ID
	**************************************************/
	this.SendRemoveEnemy = function(gameInstance, eID){
		var len = 2;
		var buff = new Buffer(len);

		buff.writeUInt8(Protocol.REMOVE_ENEMY, 0);
		buff.writeUInt8(eID, 1);
		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: WORLDSTATE_ENEMYINFO
	* Number of Enemies
	*   Enemy index
	*	Target player ID
	*   worldX
	*   worldY
	**************************************************/
	this.SendWorldstateEnemies = function(gameInstance){

		var numEnemies = gameInstance.enemies.length;
		var hb = 2; // header bytes; static; same length for every packet
		var vb = 10; // variable bytes; nonstatic; bytes per object in loop

		var len = hb + vb * numEnemies;
		var buff = new Buffer(len);

		// header bytes
		buff.writeUInt8(Protocol.WORLDSTATE_ENEMYINFO, 0);
		buff.writeUInt8(numEnemies, 1);

		// variable bytes
		for(var i = 0; i < numEnemies; i++){
			buff.writeUInt8(i, 2 + i*vb);
			buff.writeUInt8(gameInstance.enemies[i].targetPlayerID, 3 + i*vb);
			buff.writeFloatBE(gameInstance.enemies[i].worldX, 4 + i*vb);
			buff.writeFloatBE(gameInstance.enemies[i].worldY, 8 + i*vb);

			//console.log("enemy " + i + " is at (" + gameInstance.enemies[i].worldX + ", " + gameInstance.enemies[i].worldY + ")");
		}

		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	This only runs at gamestart and when spawners are activated, to show new spawners.
	* Packet Type: WORLDSTATE_SPAWNERINFO
	* Number of Spawners
	*   Spawner index
	*   worldX
	*   worldY
	**************************************************/
	this.SendWorldstateSpawners = function(gameInstance){

		var numSpawners = gameInstance.spawners.length;
		var hb = 2; // header bytes; static; same length for every packet
		var vb = 9; // variable bytes; nonstatic; bytes per object in loop

		var len = hb + vb * numSpawners;
		var buff = new Buffer(len);

		// header bytes
		buff.writeUInt8(Protocol.WORLDSTATE_SPAWNERINFO, 0);
		buff.writeUInt8(numSpawners, 1);

		// variable bytes
		for(var i = 0; i < numSpawners; i++){
			buff.writeUInt8(i, 2 + i*vb);
			buff.writeFloatBE(gameInstance.spawners[i].worldX, 3 + i*vb);
			buff.writeFloatBE(gameInstance.spawners[i].worldY, 7 + i*vb);
		}

		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: ADD_PICKUP
	* Pickup Type
	* Pickup Amount (1, 3, 5)
	**************************************************/
	this.SendAddPickup = function(gameInstance, pType, pAmount){
		var len = 3;
		var buff = new Buffer(len);

		buff.writeUInt8(Protocol.ADD_PICKUP, 0);
		buff.writeUInt8(pType, 1);
		buff.writeUInt8(pAmount, 2);
		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: REMOVE_PICKUP
	* Pickup ID
	**************************************************/
	this.SendRemovePickup = function(gameInstance, pID){
		var len = 2;
		var buff = new Buffer(len);

		buff.writeUInt8(Protocol.REMOVE_PICKUP, 0);
		buff.writeUInt8(pID, 1);
		this.SendToPlayers(buff, gameInstance.players);
	};

	/**************************************************
	* Packet Type: WORLDSTATE_PICKUPINFO
	* Number of Moving Pickups (Static ones don't need to be sent anymore)
	*   Pickup index
	*   worldX
	*   worldY
	**************************************************/
	this.SendWorldstatePickups = function(gameInstance){

		var numPickups = gameInstance.pickups.length;

		var numMoving = 0;
		for(var i = 0; i < numPickups; i++){
			if(gameInstance.pickups[i].moving) numMoving++;
		}
		var hb = 2; // header bytes; static; same length for every packet
		var vb = 9; // variable bytes; nonstatic; bytes per object in loop

		var len = hb + vb * numMoving;
		var buff = new Buffer(len);

		// header bytes
		buff.writeUInt8(Protocol.WORLDSTATE_PICKUPINFO, 0);
		buff.writeUInt8(numMoving, 1);

		// variable bytes
		var iMoving = 0;
		for(var i = 0; i < numPickups; i++){
			if(gameInstance.pickups[i].moving){
				buff.writeUInt8(i, 2 + iMoving*vb);
				buff.writeFloatBE(gameInstance.pickups[i].worldX, 3 + iMoving*vb);
				buff.writeFloatBE(gameInstance.pickups[i].worldY, 7 + iMoving*vb);
				iMoving++;
			}
		}

		this.SendToPlayers(buff, gameInstance.players);
	};
};