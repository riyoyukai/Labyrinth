package as3 {
	
	import flash.display.MovieClip;
	import flash.events.Event;
	
	// This class displays the visuals associated with the player's attacks.
	public class AttackEffects extends MovieClip {
		
		//What attack type this instance is.
		private var _type:int;

		//How many frames are left until the object cleans itself up.
		private var _framesLeft:int;

		//Which attack type is to be used. Use these when passing in type in the constructor.
		public static var LATERAL:int = 1;
		public static var OVERHEAD:int = 2;
		public static var RADIAL:int  = 3;
		
		public function AttackEffects(type:int) {
			_type = type;
			_framesLeft = 11;
			if(_type == LATERAL) gotoAndPlay(1);
			if(_type == OVERHEAD) gotoAndPlay(12);
			if(_type == RADIAL) gotoAndPlay(23);

			//Make sure _framesLeft has an event to tick down from 
			addEventListener(Event.ENTER_FRAME, Update); 
		}
		
		//Tick down _framesLeft; remove self when done.
		public function Update(e:Event){
			_framesLeft--;
			if(_framesLeft <= 0){
				removeEventListener(Event.ENTER_FRAME, Update);
				parent.removeChild(this);
			}
		}
	}	
}