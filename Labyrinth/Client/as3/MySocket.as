package as3 {
	
	import flash.display.MovieClip;
	import flash.net.DatagramSocket;
	import flash.events.DatagramSocketDataEvent;
	import flash.utils.ByteArray;
	
	// an object for sending packets to the server
	public class MySocket extends DatagramSocket {

		// server/client address info
		var SERVERIP:String = "127.0.0.1";
		var CLIENTPORT:int = 4326;
		var SERVERPORT:int = 1236;
		var serverIPReceived:Boolean = false;
		
		// constructor
		function MySocket() {
			
		}
		
		// sets up the socket to begin sending/receiving packets
		public function Start():void {
			addEventListener(DatagramSocketDataEvent.DATA, HandleData);
			bind(CLIENTPORT/*, ipClient*/);
			receive();  
		}
		
		// the event handler for receiving incoming packets
		// e	datagramsocketevent	the event that triggered the handler
		// return void
		function HandleData(e:DatagramSocketDataEvent):void {
			var type:uint = e.data.readUnsignedByte(); // get message type
			switch(type){
				case Protocol.SERVER_IP:
					if(SERVERIP == "127.0.0.1"){
						SERVERIP = e.srcAddress;
						SERVERPORT = e.srcPort;
						serverIPReceived = true;
					}
					break;
				case Protocol.BROADCAST_LOBBY_LIST:
					var numRooms:uint = e.data.readUnsignedByte();
					//trace("packet received: lobby list");
					//trace("Rooms received: " + numRooms);
					var rooms:Array = new Array();
					var seats:Array = new Array();
					if(numRooms > 0){
						for(var i:int = 0; i < numRooms; i++){
							var roomID:uint = e.data.readUnsignedByte();
							var seatsAvail:uint = e.data.readUnsignedByte();
							rooms.push(roomID);
							seats.push(seatsAvail);
						}
						
						Main.gsm.ReceiveLobbyList(rooms, seats);
					}
					break;
				case Protocol.DENIED:
					Main.gsm.SwitchToTitle();
					break;
				// Join request accepted
				case Protocol.JOIN_ACCEPT:
					var roomID:uint = e.data.readUnsignedByte();
					var playerID:uint = e.data.readUnsignedByte();
					Main.gsm.SwitchToLobby(roomID, playerID);
					break;
				// Update to the lobby
				case Protocol.LOBBY_STATE:		
					var seatsFull:uint = e.data.readUnsignedByte();
					Main.gsm.UpdateLobby(seatsFull);
					break;
				// Begin game
				case Protocol.START_ACCEPT:
					Main.gsm.SwitchToPlay();
					break;
				// Info on all players
				case Protocol.WORLDSTATE_PLAYERINFO:
					var numPlayers:uint = e.data.readUnsignedByte();
					for(var i:int = 0; i < numPlayers; i++){
						var pID:uint = e.data.readUnsignedByte();
						var px:Number = e.data.readFloat();
						var py:Number = e.data.readFloat();
						Main.gsm.ReceiveWorldstatePlayer(pID, px, py);
					}
					break;
				// Request to kill a specific player
				case Protocol.KILL_PLAYER:
					var playerToKill:uint = e.data.readUnsignedByte();
					var winner:uint = e.data.readUnsignedByte();
					trace("Winner is: " + winner);
					Main.gsm.KillPlayer(playerToKill, winner);
					break;
				// Request to play a player's attack animation
				case Protocol.ATTACK:
					var playerID:uint = e.data.readUnsignedByte();
					var attackType:uint = e.data.readUnsignedByte();
					Main.gsm.PlayAttack(playerID, attackType);
					break;
				// Request to update this player's stats
				case Protocol.STAT_UPDATE:
					var hp:uint = e.data.readUnsignedShort();
					var maxhp:uint = e.data.readUnsignedShort();
					var energy:uint = e.data.readUnsignedShort();
					var maxenergy:uint = e.data.readUnsignedShort();
					Main.gsm.UpdateStats(hp, maxhp, energy, maxenergy);
					break;
				// Request to add enemy to the world
				case Protocol.ADD_ENEMY:
					var eType:uint = e.data.readUnsignedByte();
					Main.gsm.AddEnemy(eType);
					break;
				// Request to kill a specific enemy
				case Protocol.REMOVE_ENEMY:
					var eID:uint = e.data.readUnsignedByte();
					Main.gsm.RemoveEnemy(eID);
					break;
				// Info on all enemies
				case Protocol.WORLDSTATE_ENEMYINFO:
					var numEnemies:uint = e.data.readUnsignedByte();
					for(var i:int = 0; i < numEnemies; i++){
						var pID:uint = e.data.readUnsignedByte();
						var playerID:uint = e.data.readUnsignedByte();
						var px:Number = e.data.readFloat();
						var py:Number = e.data.readFloat();
						Main.gsm.ReceiveWorldstateEnemy(pID, playerID, px, py);
					}
					break;
				// Info on all spawners
				case Protocol.WORLDSTATE_SPAWNERINFO:
					var numSpawners:uint = e.data.readUnsignedByte();
					for(var i:int = 0; i < numSpawners; i++){
						var pID:uint = e.data.readUnsignedByte();
						var px:Number = e.data.readFloat();
						var py:Number = e.data.readFloat();
						Main.gsm.ReceiveWorldstateSpawner(pID, px, py);
					}
					break;
				// Request to add a pickup to the world
				case Protocol.ADD_PICKUP:
					var pType:uint = e.data.readUnsignedByte();
					var pAmount:uint = e.data.readUnsignedByte();
					Main.gsm.AddPickup(pType, pAmount);
					break;
				// Request to remove a specific pickup
				case Protocol.REMOVE_PICKUP:
					var pID:uint = e.data.readUnsignedByte();
					Main.gsm.RemovePickup(pID);
					break;
				// Info on all pickups
				case Protocol.WORLDSTATE_PICKUPINFO:
					var numPickups:uint = e.data.readUnsignedByte();
					for(var i:int = 0; i < numPickups; i++){
						var pID:uint = e.data.readUnsignedByte();
						var px:Number = e.data.readFloat();
						var py:Number = e.data.readFloat();
						Main.gsm.ReceiveWorldstatePickups(pID, px, py);
					}
					break;
				default:
			}
		}
		
		// creates and sends a HOST packet
		function SendPacketHostLobby():void {
			var data:ByteArray = new ByteArray();
			data.writeByte(Protocol.HOST_LOBBY);
			// start countdown for host accept
			SendPacket(data);
		}
		
		// creates and sends a JOIN packet
		function SendPacketJoinLobby(roomID:int):void {
			var data:ByteArray = new ByteArray();
			data.writeByte(Protocol.JOIN_LOBBY);
			data.writeByte(roomID);
			SendPacket(data);
		}
		
		// creates and sends a LEAVE packet
		function SendPacketLeaveLobby(roomID:int):void {
			var data:ByteArray = new ByteArray();
			data.writeByte(Protocol.LEAVE_LOBBY);
			data.writeByte(roomID);
			SendPacket(data);
		}
		
		// creates and sends a START packet
		function SendPacketStartGame(roomID:int):void {
			var data:ByteArray = new ByteArray();
			data.writeByte(Protocol.START_GAME);
			data.writeByte(roomID);
			SendPacket(data);
		}
		
		// creates and sends an input packet and caches it.
		// pc	playercommand	the command to send to the server
		// @return void
		function SendPacketInput(bits:uint):void {
			var data:ByteArray = new ByteArray();
			data.writeByte(Protocol.INPUT);
			data.writeByte(bits);
			SendPacket(data);
		}
		
		// sends any packets that you give to it.
		// buff	bytearray	the packet to send.
		function SendPacket(buff:ByteArray):void {
			try {
				if(serverIPReceived)
					send(buff, 0, buff.length, SERVERIP, SERVERPORT);
				
			} catch (e:Error) {
				trace("error sending: " + e.toString());
			}
		}
	}
}
