var AABB = require("./AABB.js").AABB;

/********************************************
* Class: Level
* 
* Description: Holds the collision data
*
* Parameters: none
*********************************************/
exports.Level = function(){
	var me = this;
	this.size = global.Config.tileSize;
	this.grid = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
		[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
		[1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	/********************************************
	* Function: CheckIfOutsideLevel
	* 
	* Description: Checks if the player is outside of the playing area
	* (If they fell through world)
	* Relocate them inside if so.
	* 
	* Parameters:
	* 	entity		object		Any object 
	*********************************************/
	this.CheckIfOutsideLevel = function(entity){
		if(entity != null){
			var entityGridPos = {x:0, y:0};
			entityGridPos.x = this.WorldToGrid(entity.worldX);
			entityGridPos.y = this.WorldToGrid(entity.worldY);

			if(entityGridPos.x < 0 ||
			   entityGridPos.x > this.grid[0].length - 1 ||
			   entityGridPos.y < 0 ||
			   entityGridPos.y > this.grid.length - 1){
				var newPos = this.GetRandomSpawnLocation();
				entity.worldX = newPos.x;
				entity.worldY = newPos.y;	
			}
		}
	};

	/********************************************
	* Function: GridToWorld
	*
	* Description: Converts grid space to world coordinates
	* 
	* Parameters:
	* 	n		int		x or y grid coordinate 
	*
	* @return: 	int, world coordinate
	*********************************************/
	this.GridToWorld = function(n){
		return (n * me.size) - (me.size/2);
	};

	/********************************************
	* Function: WorldToGrid
	* 
	* Description: Converts world space to grid coordinates
	* 
	* Parameters:
	* 	n		float		x or y world coordinate 
	*
	* @return: 	int, grid coordinate
	*********************************************/
	this.WorldToGrid = function(n){
		return parseInt((n + me.size/2) / me.size);
	};
	
	/********************************************
	* Function: CheckCollisionAt
	* 
	* Description: Checks collision at specified grid coordinate
	* 
	* Parameters:
	* 	px		int		grid X coordinate 
	* 	py		int		grid Y coordinate 
	* 
	* @return: 	true if 1/collision, false if 0/no collision
	*********************************************/
	this.CheckCollisionAt = function(px, py) {
		if (px < 0) return false; // this allows player to move outside grid area
		if (py < 0) return false;
		if (px >= me.grid[0].length) return false;
		if (py >= me.grid.length) return false;

		return (me.grid[py][px] > 0);
	};
	
	/********************************************
	* Function: FixCollisions
	* 
	* Description: Checks surrounding tiles for collision
	* If no collision, ungrounds entity.
	* If collision, omits surrounding tiles so directions aren't checked twice.
	* Creates a new aabb representation of the tile and sends it to the entity
	* to calculate collision response.
	* 
	* Parameters:
	* 	entity		Object		Any object with an aabb 
	* 
	* @return: 	true if there was a collision.
	*********************************************/
	this.FixCollisions = function(entity){
		var collision = false;
		
		var minX = me.WorldToGrid(entity.aabb.Left);
		var maxX = me.WorldToGrid(entity.aabb.Right);
		var minY = me.WorldToGrid(entity.aabb.Top);
		var maxY = me.WorldToGrid(entity.aabb.Bottom);

		for (var py = minY; py <= maxY; py++) {
			for (var px = minX; px <= maxX; px++) {
				if (me.CheckCollisionAt(px, py)) {
					collision = true;

					var omitTop = false;
					var omitLeft = false;
					var omitRight = false;
					var omitBottom = false;

					if (me.CheckCollisionAt(px, py - 1)) omitBottom = true;
					//if (me.CheckCollisionAt(px - 1, py)) omitLeft = true;
					//if (me.CheckCollisionAt(px + 1, py)) omitRight = true;
					if (me.CheckCollisionAt(px, py + 1)) omitTop = true;

					var aabb = new AABB(px * me.size, py * me.size, me.size, me.size);
					aabb.Update(px*me.size, py*me.size);
					entity.FixCollisionWithStaticAABB(aabb, omitTop, omitRight, omitBottom, omitLeft);
				}
			}
		}
		if (!collision) {
			entity.grounded = false;
		}

		this.CheckIfOutsideLevel(entity);
		return collision;
	};
	
	/********************************************
	* Function: GetRandomSpawnLocation
	* 
	* Description: Randomly selects a noncollision tile
	* and returns an object with an x: and y: in world space
	* 
	* Parameters: none

	* @return: 	p	{x:0, y:0}	worldpsace coords, float
	*********************************************/
	this.GetRandomSpawnLocation = function(){
		var p = {x:0, y:0};
		while(true){
			var gx = global.Random.RangeInt(1, me.grid[0].length-2);
			var gy = global.Random.RangeInt(1, me.grid.length-2);
			
			if(me.grid[gy][gx] > 0)
				continue;
			else{
				p.x = me.GridToWorld(gx);
				p.y = me.GridToWorld(gy);
				break;
			}
		}
		return p;
	};
}