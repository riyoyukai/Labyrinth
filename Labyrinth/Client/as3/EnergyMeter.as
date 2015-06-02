package as3 {
	
	import flash.display.MovieClip;
	
	/********************************************
	* Class: EnergyMeter
	* Description:	This class controls the player's energy bar GUI.
	*********************************************/
	public class EnergyMeter extends MovieClip {
		
		var bar:MovieClip;
		
		public function EnergyMeter() {
			this.x = 20;
			this.y = 55;
			this.bar = barInstance;
		}
		
		// updates size of bar based on current and total energy
		public function Update(currentEnergy:int, totalEnergy:int):void{
			var percentage:Number = currentEnergy / totalEnergy;
			bar.width = 300 * percentage;
		}
	}
}
