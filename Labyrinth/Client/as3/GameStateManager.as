package as3 {
	import flash.display.MovieClip;

	/********************************************
	* Class: GameStateManager
	* Description:	This class controls game state flow.
	*********************************************/
	public class GameStateManager extends MovieClip{
		
		var gsCurrent:GameState;

		public function GameStateManager() {
			SwitchToTitle();
			Main.socket.Start();
		}
		
		public function Update(dt:Number):void{			
			// Only update the current game state.
			if(gsCurrent != null){
				gsCurrent.Update();
			}
		}
		
		// receives lobby list packet, sends it to GSJoin
		public function ReceiveLobbyList(rooms:Array, seats:Array):void{
			if(gsCurrent is GSJoin){
				(gsCurrent as GSJoin).ReceiveLobbyList(rooms, seats);
			}
		}

		// receives update lobby packet, sends it to GSLobby
		public function UpdateLobby(seatsFull:uint){
			if(gsCurrent is GSLobby){
				(gsCurrent as GSLobby).UpdateLobby(seatsFull);
			}
		}
		
		// receives player positions packet, sends it to GSPlay
		public function ReceiveWorldstatePlayer(pID:uint, px:Number, py:Number):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).ReceiveWorldstatePlayer(pID, px, py);
			}
		}

		// receives kill player packet, sends it to GSPlay
		// winner will be > 0 if game is over
		public function KillPlayer(playerToKill:uint, winner:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).KillPlayer(playerToKill, winner);
			}
		}

		// supposed to tell client to play attack animation, but doesn't work yet
		public function PlayAttack(playerID:uint, attackType:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).PlayAttack(playerID, attackType);
			}
		}

		// Updates player hp and energy for the UI display
		public function UpdateStats(hp:uint, maxhp:uint, energy:uint, maxenergy:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).UpdateStats(hp, maxhp, energy, maxenergy);
			}
		}
		
		// Adds an enemy to the world. Only works in GSPlay.
		// Use static values assigned in Enemy eType.
		public function AddEnemy(eType:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).AddEnemy(eType);
			}
		}

		// Removes an enemy from GSplay
		public function RemoveEnemy(eID:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).RemoveEnemy(eID);
			}
		}
		
		// receives positions of all enemies
		public function ReceiveWorldstateEnemy(pID:uint, playerID:uint, px:Number, py:Number):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).ReceiveWorldstateEnemy(pID, playerID, px, py);
			}
		}

		// receives spawner positions
		public function ReceiveWorldstateSpawner(pID:uint, px:Number, py:Number):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).ReceiveWorldstateSpawner(pID, px, py);
			}
		}

		// tells the game to add a new pickup
		public function AddPickup(pType:uint, pAmount:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).AddPickup(pType, pAmount);
			}
		}

		// tells gsplay to remove a given pickup
		public function RemovePickup(pID:uint):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).RemovePickup(pID);
			}
		}

		// receives pickup world positions
		public function ReceiveWorldstatePickups(pID:uint, px:Number, py:Number):void{
			if(gsCurrent is GSPlay){
				(gsCurrent as GSPlay).ReceiveWorldstatePickups(pID, px, py)
			}
		}

		// Switches to the title state
	    public function SwitchToTitle():void {
			if(gsCurrent != null && contains(gsCurrent)) {
        		removeChild(gsCurrent);
			}
			gsCurrent = new GSTitle(this);
			addChild(gsCurrent);
	    }

		// Switches to the lobby state
	    public function SwitchToLobby(roomID:uint, playerID:uint):void {
			removeChild(gsCurrent);
			gsCurrent = new GSLobby(this, roomID, playerID);
			addChild(gsCurrent);
	    }

		// Switches to the Join state
	    public function SwitchToJoin():void {
			removeChild(gsCurrent);
			gsCurrent = new GSJoin(this);
			addChild(gsCurrent);
	    }

		// Switches to the instructions state (no instructions)
	    public function SwitchToInstructions():void {
			removeChild(gsCurrent);
			//gsCurrent = new GSInstructions(this);
			addChild(gsCurrent);
	    }


		// Switches to the play state
		// gets the information from the lobby first though
	    public function SwitchToPlay():void {
	    	var players:Array;
	    	var roomID:uint;
	    	var playerID:uint;

			if(gsCurrent is GSLobby){
				players = (gsCurrent as GSLobby).players;
				roomID = (gsCurrent as GSLobby).roomID;
				playerID = (gsCurrent as GSLobby).playerID;
			}

			if(gsCurrent != null) removeChild(gsCurrent);
			gsCurrent = new GSPlay(this, players, roomID, playerID);
			addChild(gsCurrent);
	    }

		// Switches to the end state
	    public function SwitchToEnd(winner:uint, yourID:uint):void {
			removeChild(gsCurrent);
			gsCurrent = new GSEnd(this, winner, yourID);
			addChild(gsCurrent);
	    }


		// Switches to the credits state
	    public function SwitchToCredits():void {
			removeChild(gsCurrent);
			gsCurrent = new GSCredits(this);
			addChild(gsCurrent);
	    }
	}
}
