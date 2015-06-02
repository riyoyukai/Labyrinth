var PlayerAttack = require("./PlayerAttack.js").PlayerAttack;
var EnemyType = require("./EnemyType.js").EnemyType;

/********************************************
* Class: GenerateAttack
* 
* Description: Keeps clutter out of the player class.
* Used to generate arrays of AABB information for 
* when players attack.
* P refers to the player, facing to the right
* X refers to the attack hitboxes.
*
* Parameters: none
*********************************************/
global.GenerateAttack = {
	/********************************************
	* Function: Basic
	* 
	* Description:P X
	* 
	* Parameters:
	* 	worldX			float		worldX of the player 
	* 	worldY			float		worldY of the player 
	* 	facingLeft		boolean		true if facing left
	* 
	* @return: 	PlayerAttack[]	Array of attacks
	*********************************************/
	Basic:function(worldX, worldY, facingLeft){
		attacks = [];
		var px;
		var py;
		var pw;
		var ph;
		var dmg = 10;
		
		if(facingLeft)
			px = -(global.Config.tileSize * 0.5);
		else
			px = (global.Config.tileSize * 0.5);
		py = 0;
		pw = global.Config.tileSize * 2;
		ph = global.Config.tileSize;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph, dmg));
		return attacks;
	},

	/********************************************
	* Function: Lateral
	* 
	* Description: X P X X
	* 
	* Parameters:
	* 	worldX			float		worldX of the player 
	* 	worldY			float		worldY of the player 
	* 	facingLeft		boolean		true if facing left
	* 
	* @return: 	PlayerAttack[]	Array of attacks
	*********************************************/
	Lateral:function(worldX, worldY, facingLeft){
		attacks = [];
		var px;
		var py;
		var pw;
		var ph;
		var dmg = 40;
		
		if(facingLeft)
			px = -(global.Config.tileSize * 0.5);
		else
			px = (global.Config.tileSize * 0.5);
		py = 0;
		pw = global.Config.tileSize * 4;
		ph = global.Config.tileSize;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph, dmg));
		return attacks;
	},
	
	/********************************************
	* Function: Overhead
	* 
	* Description:
	* X X
	* P X
	* X X
	* 
	* Parameters:
	* 	worldX			float		worldX of the player 
	* 	worldY			float		worldY of the player 
	* 	facingLeft		boolean		true if facing left
	* 
	* @return: 	PlayerAttack[]	Array of attacks
	*********************************************/ 
	Overhead:function(worldX, worldY, facingLeft){
		attacks = [];
		var px;
		var py;
		var pw;
		var ph;
		var dmg = 30;
		
		if(facingLeft)
			px = -(global.Config.tileSize * 0.5);
		else
			px = (global.Config.tileSize * 0.5);
		py = 0;
		pw = global.Config.tileSize * 2;
		ph = global.Config.tileSize * 3;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph, dmg));
		return attacks;
	},
	
	/********************************************
	* Function: Radial
	* 
	* Description:
	*     X
	*   X X X
	* X X P X X
	*   X X X
	*     X
	* 
	* Parameters:
	* 	worldX			float		worldX of the player 
	* 	worldY			float		worldY of the player 
	* 	facingLeft		boolean		true if facing left
	* 
	* @return: 	PlayerAttack[]	Array of attacks
	*********************************************/
	Radial:function(worldX, worldY){
		attacks = [];
		var px;
		var py;
		var pw;
		var ph;
		var dmg = 20;
		
		px = 0;
		py = 0;
		pw = global.Config.tileSize * 3;
		ph = global.Config.tileSize * 3;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph, dmg));
		
		px = 0;
		py = (-global.Config.tileSize * 2);
		pw = global.Config.tileSize;
		ph = global.Config.tileSize;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph));
		
		px = 0;
		py = -py;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph));
		
		px = (-global.Config.tileSize * 2);
		py = 0;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph));
		
		px = -px;
		py = 0;
		
		attacks.push(new PlayerAttack(worldX + px, worldY + py, pw, ph));
		return attacks;
	}
};