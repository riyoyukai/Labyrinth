﻿package as3 {
	
	import flash.events.*;
	import flash.system.*;
	import flash.desktop.NativeApplication;
	import flash.system.fscommand;
	
	/********************************************
	* Class: GSTitle
	* Description:	Main menu.
	*********************************************/
	// This class controls the title screen.
	public class GSTitle extends GameState{

		public function GSTitle(gsm:GameStateManager) {
			super(gsm);
			
			bttnHost.addEventListener(MouseEvent.CLICK, HandleHost);
			bttnJoin.addEventListener(MouseEvent.CLICK, HandleJoin);
			bttnCredits.addEventListener(MouseEvent.CLICK, HandleCredits);
			//bttnInstructions.addEventListener(MouseEvent.CLICK, HandleInstructions);
			bttnQuit.addEventListener(MouseEvent.CLICK, HandleQuit);
		}
		
		public override function Update():void{
			
		}
		
		/////BUTTON FUNCTIONS
		public function HandleHost(e:MouseEvent):void{
			Main.socket.SendPacketHostLobby();
		}
		
		public function HandleJoin(e:MouseEvent):void{
			gsm.SwitchToJoin();
		}
		
		public function HandleCredits(e:MouseEvent):void{
			gsm.SwitchToCredits();
		}
		
		/*public function HandleInstructions(e:MouseEvent):void{
			gsm.SwitchToInstructions();
		}*/
		
		public function HandleQuit(e:MouseEvent):void{
			fscommand("quit");
 			NativeApplication.nativeApplication.exit();
		}
	}
}
