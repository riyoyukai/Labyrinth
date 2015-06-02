package as3 {
	
	import flash.display.MovieClip;
	
	/********************************************
	* Class: ENemyHOpper
	* Description:	This class controls hopper-type enemies.
	*********************************************/
	public class EnemyHopper extends Enemy {
				
		public function EnemyHopper() {
			super();
		}
		
		// Updates the Hopper based on camera, makes it face the target player
		public override function Update(cam:Camera, player:Player):void{
			var playerToTheRight:Boolean = player.worldX > this.worldX;
			if(playerToTheRight) scaleX = -1;
			else scaleX = 1;
			
			super.Update(cam, player);			
		}
	}
}
