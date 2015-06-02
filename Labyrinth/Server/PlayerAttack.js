var AABB = require("./AABB.js").AABB;

/********************************************
* Class: PlayerAttack
* 
* Description: AABB for player attacks
*
* Parameters:
* 	x			float		world x location of attack
* 	y			float		world y location of attack
* 	w 			int			width of the hitbox
* 	h 			int			height of the hitbox
* 	baseDMG 	int			Base amount of damage its worth
*********************************************/
exports.PlayerAttack = function(x, y, w, h, baseDMG){
	this.worldX = x;
	this.worldY = y;
	this.playerID;
	this.dmg = baseDMG;
	this.aabb = new AABB(this.worldX, this.worldY, w, h);
	this.aabb.Update(this.worldX, this.worldY);
};