var Player = require("./Player.js").Player;

/********************************************
* Class: PlayerList
* Description:	Holds an array of players
*********************************************/
exports.PlayerList = function(){

	this.players = []; // object, but it's an associative array
	this.length = 0;

	/********************************************
	* Function: Get
	* Description: Takes an int index in the array,
	* Returns the player at that index	
	*********************************************/
	this.Get = function(index){
		if(index < players.length - 1)
			return players[index];
		return null;
	};

	/********************************************
	* Function: GetByAddr
	* Description: returns a player based on given rinfo
	*********************************************/
	this.GetByAddr = function(rinfo){
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i] == null){
				//console.log("there is a null player in the array");
				continue;
			}
			if(this.players[i].MatchesAddr(rinfo)) return this.players[i];
		}
		return null;
	};
	
	/********************************************
	* Function: Add
	* Description: Makes a new player with the given rinfo
	* returns that player
	*********************************************/
	this.Add = function(rinfo){
		// receives rinfo, add new player
		// check that no existing players have that rinfo
		var player;
		var alreadyExists = false;
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i] == null)	continue;
			
			if(this.players[i].MatchesAddr(rinfo)){
				alreadyExists = true;
				player = this.players[i];
				//console.log("player already exists. returning found player");
			}
		}

		if(!alreadyExists){
			player = new Player(rinfo);
			this.players.push(player);
			this.length++;
		}
		return player;
	};

	/********************************************
	* Function: RemovePlayer
	* Description:	Removes given player from the array
	*********************************************/
	this.RemovePlayer = function(player){
		var returnPlayer;
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i] == null){
				//console.log("there is a null player in the array");
				continue;
			}
			if(this.players[i].MatchesAddr(player.rinfo)){
				returnPlayer = this.players.splice(i, 1)[0];
			}
		}

		if(returnPlayer == null) return; //console.log("Player does not exist.");
		else return returnPlayer;
	};

	/********************************************
	* Function: RemoveIndex
	* Description:	Removes the player at the given index.
	* Returns that player.
	*********************************************/
	this.RemoveIndex = function(index){
		if(index < this.players.length - 1 && this.players[index] != null)
			return this.players.splice(index, 1)[0];
	};
}