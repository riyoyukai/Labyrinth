package as3 {
	
	import flash.display.MovieClip;
	
	/********************************************
	* Class: Tile
	* A movieclip of a tile to display the world collision.
	*********************************************/
	public class Tile extends MovieClip {
		
		var worldX:Number;
		var worldY:Number;
		//var aabb:AABB;
		
		public function Tile(px:Number, py:Number) {
			worldX = px;
			worldY = py;
			//aabb = new AABB(worldX, worldY, width, height);
		}
		
		public function Update(cam:Camera):void{
			this.x = worldX + cam.x;
			this.y = worldY + cam.y;
			
			//aabb.Update(worldX, worldY);
		}
	}
}
