export class ZeroCell {
	constructor (
		public zeroValue ?: number,
		public isSelected ?: boolean
	) {
		this.zeroValue = null;
		this.isSelected = false;
	}
}

export class PersistData {
	constructor (
		public difficulty ?: number,
		public infiniteGame ?: boolean,
		public inProgress ?: PersistDataZero,
		public zeroStats ?: PersistDataStats
	) {
		this.difficulty = 1;
		this.infiniteGame = false;
		this.inProgress = new PersistDataZero();
		this.zeroStats = new PersistDataStats();
	}
}

export class PersistDataZero {
	constructor (
		public helpCount ?: number,
		public zeroGrid ?: ZeroCell[],
		public zeroMoves ?: number,
		public isInfinite ?: boolean
	) {
		this.helpCount = null;
		this.zeroGrid = null;
		this.zeroMoves = null;
		this.isInfinite = null;
	}
}

export class PersistDataStats {
	constructor (
		public highscore ?: number[],
		public played ?: number[],
		public won ?: number[]
	) {
		// Easy, Normal, Hard
		this.highscore = [0, 0, 0];
		this.played = [0, 0, 0];
		this.won = [0, 0, 0];
	}
}

// export class ZeroTutorial {
// 	constructor (
// 		public tutorialSize ?: number,
// 		public tutorialColors ?: number[],
// 		public tutorialSteps ?: any[],
// 		public tutorialMoves ?: number[],
// 		public arrFlood ?: ZeroCell[]
// 	) {
// 		this.tutorialSize = 4;
// 		this.tutorialColors = [0, 4, 5, 1, 2, 4, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4];
// 		this.tutorialSteps = [
// 			[4, 4, 5, 1, 2, 4, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4],
// 			[3, 3, 5, 1, 2, 3, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4],
// 			[5, 5, 5, 1, 2, 5, 5, 2, 5, 5, 1, 0, 2, 0, 0, 4],
// 			[2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 0, 2, 0, 0, 4],
// 			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 4],
// 			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
// 			[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
// 		]
// 		this.tutorialMoves = [4, 3, 5, 2, 1, 0, 4];
// 		this.arrFlood = null;
// 	}
// }