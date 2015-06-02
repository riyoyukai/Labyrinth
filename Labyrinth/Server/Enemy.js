var EnemyType = require("./EnemyType.js").EnemyType;
var AABB = require("./AABB.js").AABB;
var Pickup = require("./Pickup.js").Pickup;

/********************************************
* Class: Enemy
* 
* Description: Superclass for all enemy types.
* Contains methods common to all enemies.
*
* Parameters:
* 	x			float		initial x position
* 	y			float		initial y position
* 	w 			int			width (match Flash movieclip)
* 	h 			int			height (match Flash movieclip)
* 	health 		int			health of enemy
* 	enemyType	int			from EnemyType.js
*********************************************/
exports.Enemy = function(x, y, w, h, health, enemyType){
	this.enemyType = enemyType;
	this.worldX = x;
	this.worldY = y;
	this.width = w;
	this.height = h;
	this.health = health;
	this.aabb = new AABB(x, y, w, h);

	this.targetPlayer;
	this.targetPlayerID;

	this.grounded = false;

	this.speedX = 0;
	this.speedY = 0;
	this.maxSpeedX = 0;
	this.maxSpeedY = 0;
	this.a = 1500;
	this.damage = 10;
	this.invulnerable = false;
	this.hurtOnContact = false;

	/********************************************
	* Function: SetTarget
	* 
	* Description: Sets the enemy's target player
	* and player ID, so they know who to move toward.
	* 
	* Parameters:
	* 	player		Player		Reference to player to attack 
	* 	playerID	int			Player's position in array (0-7) 
	*********************************************/
	this.SetTarget = function(player, playerID){
		this.targetPlayer = player;
		this.targetPlayerID = playerID;
	};

	/********************************************
	* Function: Hurt
	* 
	* Description: Deals damage to enemy
	* 
	* Parameters:
	* 	amount		int		Amount of damage to deal
	*********************************************/
	this.Hurt = function(amount){
		this.health -= amount;
	};

	/********************************************
	* Function: DropPickups
	* 
	* Description: Generates pickups when killed and
	* returns array of pickups to be taken by the Game
	* class to be updated.
	* 
	* Parameters: none
	* 
	* @return: 	pickups		Pickup[]	Array of pickups
	*********************************************/
	this.DropPickups = function(){
		var pickups = [];
		var numToSpawn = global.Random.RangeInt(1, 5);
		for(var i = 0; i < numToSpawn; i++){
			var rx = global.Random.Range(this.aabb.Left, this.aabb.Right);
			var ry = global.Random.Range(this.aabb.Top, this.aabb.Bottom);
			pickups.push(new Pickup(rx, ry));
		}
		return pickups;
	};
};