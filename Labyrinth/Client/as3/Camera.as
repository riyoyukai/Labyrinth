package as3 {
	
/********************************************
* Class: Camera
* Description: Tracks opposite of player movement to adjust screen position of all entities.	
*********************************************/
	public class Camera {

		var x:Number, y:Number; // the amount relative to the player to move everything
		var halfW:int, halfH:int; // stage height and width

		public function Camera() {
			halfW = Config.StageWidth/2;
			halfH = Config.StageHeight/2;
		}
		
		/********************************************
		* Function: Update
		* Description: Receives focus player position
		*********************************************/
		public function Update(targetX:Number, targetY:Number){
			x = -targetX + halfW;
			y = -targetY + halfH;
		}
	}
}
