package as3 {
	
	import flash.display.MovieClip;
	
	/********************************************
	* Class: EnemyBullet
	* Description:	This class is used to track projectiles.
	* Unused for now.
	*********************************************/
	public class EnemyBullet extends Enemy {
						
		public function EnemyBullet(degrees:Number) {
			
			super();

			rotation = degrees;

			//if(speedX > 0) rotation = 0 - rotation;
		}
		
		public override function Update(cam:Camera, player:Player):void{		
			super.Update(cam, player);			
		}
	}
}
