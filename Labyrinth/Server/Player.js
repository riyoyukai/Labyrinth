var AABB = require("./AABB.js").AABB;
var PlayerAttack = require("./PlayerAttack.js").PlayerAttack;
var AttackType = require("./AttackType.js").AttackType;
var AttackGenerator = require("./AttackGenerator.js");

/********************************************
* Class: Player
* Description: Keeps track of the IP address of remote
* client, and also the player object in game.
*********************************************/
exports.Player = function(rinfo){
	var me = this;
	this.hosting = false;
	this.rinfo = rinfo;
	this.timeSinceLastPacket = 0;
	this.roomID;

	this.Keys = {
		Q:false, // attack 1
		W:false, // attack 2
		E:false, // attack 3

		P:false, // JumpOnPress
		J:false, // Jump
		L:false, // Left
		R:false, // Right

		/********************************************
		* Function: Keys.Update
		* Description: Updates the player input
		* q: Attack1
		* w: Attack2
		* e: Attack3
		* p: JumpPrev
		* j: Jump
		* l: Left
		* r: Right
		*********************************************/
		Update:function(q, w, e, p, j, l, r){
			//console.log("q" + q + ", w" + w + ", e" + e + ", p" + p + ", j" + j + ", l" + l + ", r" + r);
			this.Q = q;
			this.W = w;
			this.E = e;

			this.P = p;
			this.J = j;
			this.L = l;
			this.R = r;
			
			me.Refresh();
		}
	};

	///////////////////////// GAME VARIABLES:
	this.width = 35;
	this.height = 64;

	this.aabb;
	this.worldX;
	this.worldY;
	this.speedX = 0;
	this.speedY = 0;
	this.maxSpeedX = 500;
	this.maxSpeedY = 650;
	this.a = 1500;

	this.facingLeft = true;
	this.grounded = false;

	this.jumpJuice = 0;
	this.jumpJuiceMax = 1.8;

	this.hasJetpack = true;
	this.hasDoubleJump = false;
	this.hasBuzzsaw = true;
	this.jumpsLeft = 2;

	this.lives = 1;//3;
	this.health = 100;
	this.maxHealth = 100;
	this.hurtTimer = 0;
	this.hurtTimerMax = 1.5;

	this.energy = 100;
	this.maxEnergy = 100;
	this.damageMultiplier = 1;
	this.speedMultiplier = 1;
	this.regeneration = 0;

	this.attacks = [];
	this.isAttacking = false;
	/////////////////////////

	/********************************************
	* Function: Refresh
	* Description: When an input packet is received
	* refreshes the player so they don't disconnect
	*********************************************/
	// keeps track of how long it's been since last packet
	this.Refresh = function(){
		this.timeSinceLastPacket = 0;
	};
	
	/********************************************
	* Function: CheckForTimeout
	* Description:	checks to see if it's time to
	* disconnect them, if it's been too long since
	* packets were received.
	*********************************************/
	this.CheckForTimeout = function(dt){
		this.timeSinceLastPacket += dt;
		if(this.timeSinceLastPacket >= 10000){
			return true;
		}

		return false;
	};

	/********************************************
	* Function: 
	* Description:	used to tell if, when packet
	* is received, which player it was from, by 
	* comparing the rinfo IP address.
	*********************************************/
	this.MatchesAddr = function(rinfo){
		if(rinfo.address != this.rinfo.address) return false;
		if(rinfo.port != this.rinfo.port) return false;
		return true;
	};

	/********************************************
	* Function: SetUp
	* Description:	Initializes the player
	*********************************************/
	this.SetUp = function(x, y){
		this.timeSinceLastPacket = 0;
		this.worldX = x;
		this.worldY = y;
		this.aabb = new AABB(this.worldX, this.worldY, this.width, this.height);
		this.lives = 1;
		this.health = 100;
		this.maxHealth = 100;
		this.hurtTimer = 0;
		this.hurtTimerMax = 1.5;

		this.energy = 100;
		this.maxEnergy = 100;
		this.damageMultiplier = 1;
		this.speedMultiplier = 1;
	};

	/********************************************
	* Function: Respawn
	* Description: Called when a player dies.
	* resets their position to (pos)
	*********************************************/
	this.Respawn = function(pos){
		this.lives--;
		if(this.lives > 0){
			this.health = this.maxHealth;
			this.worldX = pos.x;
			this.worldY = pos.y;
		}
		global.Labyrinth.socket.SendStats(me);
	};

	/********************************************
	* Function: AddHealth
	* Description:	Adds health pickup and recalculates current health
	*********************************************/
	this.AddHealth = function(amount){
		var percentage = me.health/me.maxHealth;
		me.maxHealth += amount;
		me.health = Math.ceil(me.maxHealth * percentage);
		global.Labyrinth.socket.SendStats(me);
	};

	/********************************************
	* Function: AddEnergy
	* Description:	Adds energy pickup and recalculates current energy
	*********************************************/
	this.AddEnergy = function(amount){
		var percentage = me.energy/me.maxEnergy;
		me.maxEnergy += amount;
		me.energy = Math.ceil(me.maxEnergy * percentage);
		global.Labyrinth.socket.SendStats(me);
	};

	/********************************************
	* Function: Hurt
	* Description:	Does damage to the player
	*********************************************/
	this.Hurt = function(amount){
		if(me.hurtTimer <= 0){
			me.hurtTimer = me.hurtTimerMax;
			me.health -= amount;
			if(me.health < 0) me.health = 0;
			global.Labyrinth.socket.SendStats(me);
		}
	};
		
	/********************************************
	* Function: Heal
	* Description: Restores HP, currently unused
	*********************************************/
	this.Heal = function(amount){
		me.health += amount;
		if(me.health > me.maxHealth) me.health = me.maxHealth;
		global.Labyrinth.socket.SendStats(me);
	};

	/********************************************
	* Function: Jump
	* Description:	Causes the player to jump
	*********************************************/
	this.Jump = function(){
		me.jumpJuice = me.jumpJuiceMax;
		me.speedY = -me.maxSpeedY;
		me.grounded = false;
		me.jumpsLeft--;
	};
		
	/********************************************
	* Function: Land
	* Description: Lands the player.
	*********************************************/
	this.Land = function(){
		me.grounded = true;
		me.speedY = 0;
		me.jumpsLeft = 2;
	};

	/********************************************
	* Function: Update
	* Description:	Updates the player
	*********************************************/
	this.Update = function(dt){
		////////////////////////// GAME UPDATE:
		if(this.lives <= 0) return;
		if(this.hurtTimer >= 0) this.hurtTimer -= dt;

		// Energy regeneration
		this.regeneration += this.maxEnergy * 0.6 * dt;
		if(this.regeneration > 1 && this.energy < this.maxEnergy){
			this.regeneration--;
			this.energy++;
			if(this.energy > this.maxEnergy) this.energy = this.maxEnergy;
			global.Labyrinth.socket.SendStats(me);
		}
		// End energy regeneration
		
		// Horizontal Movement
		if(this.Keys.L){
			this.facingLeft = true;
			this.speedX -= this.a * dt * this.speedMultiplier;
		}else if(this.Keys.R){
			this.facingLeft = false;
			this.speedX += this.a * dt * this.speedMultiplier;
		}else{
			this.speedX *= .8;
		}
		
		if(this.speedX > this.maxSpeedX) this.speedX = this.maxSpeedX;
		if(this.speedX < -this.maxSpeedX) this.speedX = -this.maxSpeedX;
		
		this.worldX += this.speedX * dt;
		// End Horizontal Movement
		
		// Vertical Movement			
		if(this.hasJetpack && this.Keys.J){
			this.speedY -= this.a * dt * (global.Config.gravity + 1);
			this.grounded = false;
		}else if(this.Keys.P && this.grounded){
			this.Jump();
		}else if(this.hasDoubleJump && this.Keys.P && this.jumpsLeft > 0){
			this.Jump();
		}
		if(!this.grounded){
			this.speedY += this.a * dt * global.Config.gravity;
			this.speedY -= this.jumpJuice * 40;
			this.jumpJuice -= dt;
			if(this.jumpJuice < 0) this.jumpJuice = 0;
			
			if(!this.Keys.J) this.jumpJuice = 0;
			
			if(this.speedY > this.maxSpeedY) this.speedY = this.maxSpeedY; // falling
			if(this.speedY < -this.maxSpeedY) this.speedY = -this.maxSpeedY; // rising
			
		}
		
		this.worldY += this.speedY * dt;
		// End Vertical Movement

		// Attack logic
		me.isAttacking = false;
		if(me.Keys.Q){
			if(me.energy >= 20){
				me.energy -= 20;
				me.attacks = global.GenerateAttack.Lateral(me.worldX, me.worldY, me.facingLeft);
				me.isAttacking = true;
				global.Labyrinth.socket.SendAttack(me, AttackType.LATERAL);
			}
		}
		else if(me.Keys.W){
			if(me.energy >= 35){
				me.energy -= 35;
				me.attacks = global.GenerateAttack.Overhead(me.worldX, me.worldY, me.facingLeft);
				me.isAttacking = true;
				global.Labyrinth.socket.SendAttack(me, AttackType.OVERHEAD);
			}
		}
		else if(me.Keys.E){
			if(me.energy >= 50){
				me.energy -= 50;
				me.attacks = global.GenerateAttack.Radial(me.worldX, me.worldY);
				me.isAttacking = true;
				global.Labyrinth.socket.SendAttack(me, AttackType.RADIAL);
			}
		}
		// End attack logic		
		
		this.aabb.Update(this.worldX, this.worldY);
		////////////////////////// END GAME UPDATE
	};

	/********************************************
	* Function: FixCollisionWithStaticAABB
	* Description: Collision response to the level collision data
	*********************************************/
	this.FixCollisionWithStaticAABB = function(other, omitTop, omitRight, omitBottom, omitLeft){

		if(me.aabb.Right < other.Left) return;
		if(me.aabb.Left > other.Right) return;
		if(me.aabb.Bottom < other.Top) return;
		if(me.aabb.Top > other.Bottom) return;
		
		var overlapB1 = other.Bottom - me.aabb.Top; // distance to move down; OVERLAP B
		var overlapT1 = other.Top - me.aabb.Bottom; // distance to move up; OVERLAP T
		var overlapR1 = other.Right - me.aabb.Left; // distance to move right; OVERLAP R
		var overlapL1 = other.Left - me.aabb.Right; // distance to move left; OVERLAP L

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
			me.Land();
		}
		if (!omitRight && overlapR <= overlapT && overlapR <= overlapB && overlapR <= overlapL) {
			// your left side collided
			solutionX = overlapR1;
			me.speedX = 0;
		}
		if (!omitBottom && overlapB <= overlapT && overlapB <= overlapR && overlapB <= overlapL) {
			// your top side collided
			solutionY = overlapB1;
			me.speedY = 0;
		}
		if (!omitLeft && overlapL <= overlapT && overlapL <= overlapR && overlapL <= overlapB) {
			// your right side collided
			solutionX = overlapL1;
			me.speedX = 0;
		}
		
		me.worldX += solutionX;
		me.worldY += solutionY;
		
		me.aabb.Update(me.worldX, me.worldY);
	};
};