package as3 {
	
	import flash.display.MovieClip;
	import flash.events.*;	
	
	/********************************************
	* Class: GSCredits
	* Description:	Displays credits
	*********************************************/
	public class GSCredits extends GameState {
		
		public function GSCredits(gsm:GameStateManager) {
			super(gsm);
			
			bttnQuit.addEventListener(MouseEvent.CLICK, HandleQuit);
		}
		
		public override function Update():void{
			
		}
		
		public function HandleQuit(e:MouseEvent):void{
			gsm.SwitchToTitle();
		}
	}
}
