
var Socket = require("./Socket.js").Socket;
var PlayerList = require("./PlayerList.js").PlayerList;
var Game = require("./Game.js").Game;

/********************************************
* Class: Config
* 
* Description: Holds global data
*********************************************/
global.Config = {
	gravity:2,
	tick:33,
	LOCALIP: "127.0.0.1",
	BROADCASTIP: "255.255.255.255",
	SERVERPORT:1236,
	CLIENTPORT:4326,
	tileSize:64,
	numSpawners:20
};

/********************************************
* Class: Random
* Description: Holds convenience random methods
*********************************************/
global.Random = { 
	/********************************************
	* Function: Range
	* Description: Generates a random float between
	* min and max
	* 
	* Parameters:
	* 	min		float	minimum range (inclusive) 
	* 	max		float	maximum range (exclusive) 
	*
	* @return: 	num   float   random number chosen
	*********************************************/
	Range:function(min, max){
		var num = (Math.random() * (max - min)) + min;
		return num;
	},

	/********************************************
	* Function: RangeInt
	* Description: Generates a random int between
	* min and max
	* 
	* Parameters:
	* 	min		int		minimum range (inclusive) 
	* 	max		int		maximum range (inclusive) 
	*
	* @return: 	num   int   random number chosen
	*********************************************/
	RangeInt:function(min, max){ // max is inclusive
		var num = Math.floor(Math.random() * (max - min + 1)) + min;
		return num;
	},

	/********************************************
	* Function: ChooseOne
	* Description: Returns a random element from the given array
	* 
	* Parameters:
	* 	array		object[]		the array of objects to choose from 
	* @return: 	random object in that array
	*********************************************/
	ChooseOne:function(array){
		return array[global.Random.RangeInt(0, array.length-1)];
	}
};

/********************************************
* Class: Labyrinth
* Description: Main game function, holds the socket,
* player list, gamelist, joinable games, etc.
*********************************************/
global.Labyrinth = {
	roomID:0,
	players:new PlayerList(),
	gamelist:[null],
	joinableGames:0,
	socket:new Socket(),

	/********************************************
	* Function: Start
	* Description:	Begins the game.
	*********************************************/
	Start:function(){
		this.socket.Listen();
		this.socket.BroadcastKickAll();
	},

	/********************************************
	* Function: Play
	* Description: Starts the specified lobby
	* 
	* Parameters:
	* 	id		int		ID of the game/lobby to start 
	*********************************************/
	Play:function(id){ // call this to start the gameloop
		this.gamelist[id].started = true;
		this.gamelist[id].SetUp();
	},
};

global.Labyrinth.Start();