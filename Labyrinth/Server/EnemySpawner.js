var AABB = require("./AABB.js").AABB;
var EnemyType = require("./EnemyType.js").EnemyType;
var EnemyHopper = require("./EnemyHopper.js");

/********************************************
* Class: EnemySpawner
* 
* Description: When player collides with this, it
* will activate and generate a list of enemies.
*
* Parameters:
* 	pos		{x, y}		world position it should spawn at
*********************************************/
function EnemySpawner(pos){
	var me = this;
	this.worldX = pos.x + global.Config.tileSize/2;
	this.worldY = pos.y + global.Config.tileSize/2;
	this.width = global.Config.tileSize;
	this.height = global.Config.tileSize;
	this.aabb = new AABB(me.worldX, me.worldY, me.width, me.height);

	/********************************************
	* Function: Update
	* Description:	Only needs to be called when
	* its position changes.
	*********************************************/
	this.Update = function(){
		me.aabb.Update(me.worldX, me.worldY);
	};

	/********************************************
	* Function: SpawnEnemies
	* Description: Randomly generates enemies and returns
	* the generated enemies.
	* Currently only generates hoppers.
	*********************************************/
	this.SpawnEnemies = function(){
		var enemies = [];
		var turretSpawned = false;
		var eTypesAvailable = [/*EnemyType.TURRET, */EnemyType.HOPPER];//, EnemyType.AERIAL, EnemyType.RANGER];
		var numToSpawn = global.Random.RangeInt(1, 5);
		for(var i = 0; i < numToSpawn; i++){
			var rx = global.Random.Range(this.aabb.Left, this.aabb.Right);
			var ry = global.Random.Range(this.aabb.Top, this.aabb.Bottom);
			if(turretSpawned) eTypesAvailable.shift(); // removes TURRET from possible enemies if a turret has already spawned
			
			switch(global.Random.ChooseOne(eTypesAvailable)){
				case EnemyType.TURRET:
					//enemies.push(new EnemyTurret(rx, ry));
					turretSpawned = true;
					break;
				case EnemyType.HOPPER:
					enemies.push(new EnemyHopper(rx, ry));
					break;
				case EnemyType.AERIAL:
					//enemies.push(new EnemyAerial(rx, ry));
					break;
				case EnemyType.RANGER:
					//enemies.push(new EnemyRanger(rx, ry));
					break;
			}
		}
		return enemies;
	};
};

module.exports = EnemySpawner;
