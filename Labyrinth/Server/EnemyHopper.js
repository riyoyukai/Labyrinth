var EnemyType = require("./EnemyType.js").EnemyType;
var Enemy = require("./Enemy.js").Enemy;
var AABB = require("./AABB.js").AABB;

/********************************************
* Class: EnemyHopper
* 
* Description: Small, weak enemy that jumps towards player.
* Can only move horizontally while in the air.
*
* Parameters:
* 	x		float		The x position to start at.
* 	y		float		The y position to start at.
*********************************************/
function EnemyHopper(x, y){
	Enemy.call(this, x, y, 33, 33, 30, EnemyType.HOPPER);

	this.maxSpeedX = 350;
	this.maxSpeedY = 450;
	this.hurtOnContact = true;

	this.jumpTimer = 0;
	this.jumpTimerMin = .2;
	this.jumpTimerMax = 2;
	
	this.moveRight = false;
	this.moveLeft = false;

	/********************************************
	* Function: Jump
	* 
	* Description: Ungrounds the hopper, sets y speed,
	* and resets the jump timer.
	* 
	* Parameters: none
	*********************************************/
	this.Jump = function(){
		this.grounded = false;
		this.speedY = -this.maxSpeedY;
		this.jumpTimer = global.Random.Range(this.jumpTimerMin, this.jumpTimerMax);
	};

	/********************************************
	* Function: Land
	* 
	* Description: Grounds the hopper and sets speeds to 0
	* 
	* Parameters: none
	*********************************************/
	this.Land = function(){
		this.grounded = true;
		this.speedX = 0;
		this.speedY = 0;
	};

	/********************************************
	* Function: Update
	* 
	* Description: 
	* 
	* Parameters:
	* 	dt		float	deltaTime
	*********************************************/
	this.Update = function(dt){
		// If in the air, move horizontally
		if(!this.grounded){
			this.speedY += this.a * dt; // gravity
			
			if(this.moveRight){
				this.speedX += this.a * dt;
			}
			else if(this.moveLeft){
				this.speedX -= this.a * dt;
			}else{
				this.speedX *= .85;
			}
			
			// stop moving forward if player got behind it
			if(this.targetPlayer.worldX > this.worldX) this.moveLeft = false;
			if(this.targetPlayer.worldX < this.worldX) this.moveRight = false;
			
			// x speed clamping
			if(this.speedX > this.maxSpeedX) this.speedX = this.maxSpeedX;
			if(this.speedX < -this.maxSpeedX) this.speedX = -this.maxSpeedX;
		// if grounded, decide which way to move next
		}else{
			if(this.targetPlayer.worldX > this.worldX){
				this.moveRight = true;
				this.moveLeft = false;
			}
			if(this.targetPlayer.worldX < this.worldX){
				this.moveRight = false;
				this.moveLeft = true;
			}

			// decrement jump timer
			this.jumpTimer -= dt;
			if(this.jumpTimer <= 0){
				this.Jump();
			}
		}

		// update world position
		this.worldX += this.speedX * dt;
		this.worldY += this.speedY * dt;

		// update hitbox
		this.aabb.Update(this.worldX, this.worldY);
	};

	/********************************************
	* Function: FixCollisionWithStaticAABB
	* 
	* Description: Collision response with the level
	* 
	* Parameters:
	* 	other			aabb	The AABB of the level tile 
	* 	omitTop			Boolean		True if already checked a tile in that direction. 
	* 	omitRight		Boolean		True if already checked a tile in that direction. 
	* 	omitBottom		Boolean		True if already checked a tile in that direction. 
	* 	omitLeft		Boolean		True if already checked a tile in that direction. 
	*********************************************/
	this.FixCollisionWithStaticAABB = function(other, omitTop, omitRight, omitBottom, omitLeft){

		if(this.aabb.Right < other.Left) return;
		if(this.aabb.Left > other.Right) return;
		if(this.aabb.Bottom < other.Top) return;
		if(this.aabb.Top > other.Bottom) return;
		
		var overlapB1 = other.Bottom - this.aabb.Top; // distance to move down; OVERLAP B
		var overlapT1 = other.Top - this.aabb.Bottom; // distance to move up; OVERLAP T
		var overlapR1 = other.Right - this.aabb.Left; // distance to move right; OVERLAP R
		var overlapL1 = other.Left - this.aabb.Right; // distance to move left; OVERLAP L

		var overlapB = Math.abs(overlapB1);
		var overlapT = Math.abs(overlapT1);
		var overlapR = Math.abs(overlapR1);
		var overlapL = Math.abs(overlapL1);

		var solutionX = 0;
		var solutionY = 0;

		// find solution
		if (!omitTop && overlapT <= overlapB && overlapT <= overlapR && overlapT <= overlapL) {
			// your bottom side collided
			solutionY = overlapT1;
			this.Land();
			
		}
		if (!omitRight && overlapR <= overlapT && overlapR <= overlapB && overlapR <= overlapL) {
			// your left side collided
			solutionX = overlapR1;
			this.speedX = 0;
			
		}
		if (!omitBottom && overlapB <= overlapT && overlapB <= overlapR && overlapB <= overlapL) {
			// your top side collided
			solutionY = overlapB1;
			this.speedY = 0;
			
		}
		if (!omitLeft && overlapL <= overlapT && overlapL <= overlapR && overlapL <= overlapB) {
			// your right side collided
			solutionX = overlapL1;
			this.speedX = 0;

		}
		
		// update world position
		this.worldX += solutionX;
		this.worldY += solutionY;
		
		// update hitbox
		this.aabb.Update(this.worldX, this.worldY);
	};
};

// set superclass
EnemyHopper.prototype = new Enemy();

module.exports = EnemyHopper;