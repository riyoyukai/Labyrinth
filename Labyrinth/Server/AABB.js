/********************************************
* Class: AABB
* Description:	An axis-aligned bounding box used to 
* keep track of the collision box for game objects. 
* based on center point, not top left.
*
* Parameters:
* 	x			float	x position of the object (center)
* 	y			float	y position of the object (center)
* 	width 		int		width of the object
* 	height 		int		height of the object
*********************************************/
exports.AABB = function(x, y, width, height){
	var me = this;

	this.x = x;
	this.y = y;
	this.halfW = width/2;
	this.halfH = height/2;
	this.Left;
	this.Right;
	this.Top;
	this.Bottom;

	/********************************************
	* Function: Update
	* Description:	Sets the position and edges of the AABB.
	* 
	* Parameters:
	* 	x	float	The new x position of the aabb
	* 	y	float	The new y position of the aabb
	* @return: 		n/a
	*********************************************/
	this.Update = function(x, y){
		this.x = x;
		this.y = y;
		this.Left = x - this.halfW;
		this.Right = x + this.halfW;
		this.Top = y - this.halfH;
		this.Bottom = y + this.halfH;
	};	

	/********************************************
	* Function: IsCollidingWith
	* Description:	Simple axis-aligned bounding
	* box overlap collision detection.
	* 
	* Parameters:
	* 	other		AABB	the other AABB to check for overlaps. 
	* @return: 		true if overlap, false if not.
	*********************************************/
	this.IsCollidingWith = function(other){
		if(this.Right < other.Left) return false;
		if(this.Left > other.Right) return false;
		if(this.Bottom < other.Top) return false;
		if(this.Top > other.Bottom) return false;
		return true;
	};

	/********************************************
	* Function: GetString
	* Description:	Convenience method for debugging AABB info.
	* I got tired of rewriting this a lot.
	* 
	* Parameters:
	* 	none			
	* @return: 		string
	*********************************************/
	this.GetString = function(){
		return "Left: " + this.Left + "\nRight: " + this.Right + "\nTop: " + this.Top + "\nBottom: " + this.Bottom;
	};
};