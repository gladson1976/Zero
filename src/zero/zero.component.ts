import { Component, ViewChild, HostListener, ElementRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from "rxjs";
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { WindowRef } from './windowref.service';
import { ZeroService } from './zero.service';
import { ZeroCell, PersistData, PersistDataZero, PersistDataStats } from './zero.model';

@Component({
  selector: 'zero-root',
  templateUrl: './zero.component.html',
  styleUrls: ['./zero.component.css'],
  providers: [ZeroService],
  encapsulation: ViewEncapsulation.None
})
export class ZeroComponent {

  constructor( private modalService: NgbModal, private _sanitizer: DomSanitizer, private winRef: WindowRef, private zeroService: ZeroService ) {}

  @ViewChild('popupConfirm') private popupConfirm;
  @ViewChild('popupSettings') private popupSettings;
  @ViewChild('popupHighscore') private popupHighscore;
  @ViewChild('popupHelp') private popupHelp;
  @ViewChild('popupDebug') private popupDebug;
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.savePersistData(true);
  }

  title:string = 'Zero';
  zeroVersion:string = "1.0";
  isDebug:boolean = false;
  persistData:PersistData = null;
  zeroSize:number = 8;
  zeroPopupMessage:string[] = [];
  display:any = {
    zeroViewport: Math.floor(this.VW2PX(100) / this.zeroSize) + "px",
    zeroCellSize: null,
    zeroHintSize: null,
    zeroKeySize: null
  }
  openPopup:NgbModalRef = null;

  helpCounter:number = 3;
  flashHint:boolean = false;
  selectedDifficulty:number = 1;
  arrDifficulty:any[] = [
    {"index": 0, "difficultyName": "Easy", "zeroSize": 5, "minValue": -50, "maxValue": 50, "clueCount": 5},
    {"index": 1, "difficultyName": "Normal", "zeroSize": 5, "minValue": -100, "maxValue": 100, "clueCount": 3},
    {"index": 2, "difficultyName": "Hard", "zeroSize": 5, "minValue": -500, "maxValue": 500, "clueCount": 1}
  ];
  clueCount:number = this.arrDifficulty[this.selectedDifficulty].clueCount;

  arrGrid:ZeroCell[] = null;
  zeroMoves:number = 0;
  zeroInProgress:boolean = false;
  zeroComplete:boolean = false;

  newHighscore:boolean = false;
  zeroMessage:string = "";
  dummyArray = Array;

  arrClearPath:number[] = new Array();
  arrClearPathPosition:number[] = new Array();
  arrClearPathSize:number[] = [3, 5, 7];
  numClearPath:number = 0;
  clearFlag:boolean = false;
  showingPath:boolean = false;
  
  clearedCells:number[] = [];
  
  solutionFound:boolean = false;
  zeroStack:number[] = new Array();
  zeroStackPos:number[] = new Array();
  sumInStack:number = 0;
  TARGET_SUM:number = 0;
  solutionSize:number = 3;

  zeroSum:number = null;
  zeroClickCount:number = null;
  arrClearFlash:number[] = new Array();
  isInfinite:boolean = false;
  arrEmptyCells:number[] = [];
  showNewZeros:boolean = false;

  private VW2PX(VW) {
    let w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
    let x = w.innerWidth || e.clientWidth || g.clientWidth;
    let result = Math.floor((x * VW ) / 100);
    return result;
  }

  private getRandom(min, max) {
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private resizeViewport() {
    let cellSize = null;
    let hintSize = null;
    let keySize = null;
    keySize = Math.floor(this.VW2PX(96) / this.zeroSize);
    this.display.zeroCellSize = keySize + "px";
    hintSize = Math.floor((keySize - 2) / 3);
    this.display.zeroHintSize = hintSize + "px";
    this.display.zeroKeySize = this.display.zeroCellSize;
  }

  private ngOnInit() {
    this.loadPersistData();
    this.resizeViewport();
    if(this.persistData.inProgress.zeroGrid === null) {
      this.newZero();
    }
    this.savePersistData();
  }

  ngOnDestroy() {
    this.savePersistData(true);
  }

  loadPersistData() {
    if (this.winRef.nativeWindow.AppInventor) {
      this.persistData = JSON.parse(this.winRef.nativeWindow.AppInventor.getWebViewString());
    } else {
      this.persistData = JSON.parse(localStorage.getItem("zeroPersist"));
    }

    if(this.persistData === null) {
      this.persistData = new PersistData();
    }

    if(this.persistData !== null) {
      this.selectedDifficulty = this.persistData.difficulty;
      this.zeroSize = this.arrDifficulty[this.selectedDifficulty].zeroSize;
      this.isInfinite = this.persistData.inProgress.isInfinite;
      // this.zeroSize = Math.sqrt(this.persistData.inProgress.zeroGrid.length);
      this.arrGrid = this.persistData.inProgress.zeroGrid;
      this.helpCounter = this.persistData.inProgress.helpCount;
      this.zeroInProgress = true;
      this.zeroMoves = this.persistData.inProgress.zeroMoves;
      this.zeroSum = 0;
      this.zeroClickCount = 0;
      if(this.arrGrid !== null) {
        for(let i = 0; i < this.arrGrid.length; i++) {
          if(this.arrGrid[i].isSelected) {
            this.zeroClickCount++;
            this.zeroSum += this.arrGrid[i].zeroValue;
          }
        }
        this.zeroMessage = this.zeroSum.toString();
        this.getClearPath();
      }
    }
    console.log(this.persistData)
  }

  savePersistData(saveGrid:boolean = true) {
    this.persistData.difficulty = this.selectedDifficulty;
    if(saveGrid) {
      this.persistData.inProgress.helpCount = this.helpCounter;
      this.persistData.inProgress.zeroGrid = this.arrGrid;
      this.persistData.inProgress.zeroMoves = this.zeroMoves;
      this.persistData.inProgress.isInfinite = this.isInfinite;
    }
    if (this.winRef.nativeWindow.AppInventor) {
      this.winRef.nativeWindow.AppInventor.setWebViewString(JSON.stringify(this.persistData));
    } else {
      localStorage.setItem("zeroPersist", JSON.stringify(this.persistData));
    }
  }

  newZero() {
    let gridSize = Math.pow(this.zeroSize, 2);
    this.zeroSize = this.arrDifficulty[this.selectedDifficulty].zeroSize;
    this.isInfinite = this.persistData.infiniteGame;
    this.arrGrid = this.zeroService.nDArray(gridSize);
    this.helpCounter = this.arrDifficulty[this.selectedDifficulty].clueCount;
    this.zeroInProgress = true;
    this.zeroComplete = false;
    this.zeroMessage = "";
    this.zeroMoves = 0;
    this.zeroSum = 0;
    this.zeroClickCount = 0;

    let tempCell:ZeroCell = null;
    let minValue = this.arrDifficulty[this.selectedDifficulty].minValue;
    let maxValue = this.arrDifficulty[this.selectedDifficulty].maxValue;
    for(let i = 0; i < gridSize; i++){
      tempCell = new ZeroCell();
      tempCell.zeroValue = this.getZeroValue(minValue, maxValue);
      this.arrGrid[i] = tempCell;
    }

    this.getClearPath();
  }

  getZeroValue(minValue:number, maxValue:number) {
    let NP:number = null;
    let X:number = null;
    let D:number = null;
    let zeroValue:number = null

    NP = this.getRandom(0, 1);
    D = this.getRandom(0, 1);
    if(NP === 0) {
      X = this.getRandom(minValue + 1, -1)
      if(D === 0)
        zeroValue = this.getRandom(minValue + 1, X);
      else
        zeroValue = this.getRandom(X, -1);
    } else {
      X = this.getRandom(1, maxValue - 1)
      if(D === 0)
        zeroValue = this.getRandom(X, maxValue - 1);
      else
        zeroValue = this.getRandom(1, X);
    }
    return zeroValue;
  }

  getZeroPath(itemsGrid, itemsGridPos) {
    let arrPermutations = [];
    let arrPermutationsPos = [];
    let permutation;
    let permutationPos;
    let numLayer = 0;
    let numDepth = 4;
    let numAttempts = 0;
    let permutationSum;
    
    let ss = function(itemsGrid, itemsGridPos) {
      let TARGET_SUM = 0;
      let itemGrid = itemsGrid.shift();
      let itemGridPos = itemsGridPos.shift();
      for(let i = 1; i <= itemsGrid.length; i++) {
        numAttempts++;
        if(numAttempts <= itemsGrid.length * itemsGrid.length) {
          if(numLayer === 0) {
            permutation = [itemsGrid[0], itemsGrid[i]];
            permutationPos = [itemsGridPos[0], itemsGridPos[i]];
          } else {
            permutation = arrPermutations.shift();
            permutationPos = arrPermutationsPos.shift();
            if(permutationPos.indexOf(itemsGridPos[0]) === -1) {
              permutation.push(itemsGrid[0]);
              permutationPos.push(itemsGridPos[0]);
            }
          }
          permutationSum = 0;
          for(let j = 0; j < permutation.length; j++) {
            permutationSum += permutation[j];
          }
          arrPermutations.push(permutation);
          arrPermutationsPos.push(permutationPos);
          if(permutationSum === TARGET_SUM && permutation.length > 2) {
            return [permutation, permutationPos];
          }
        } else {
          if(numLayer < numDepth) {
            numAttempts = 0;
            numLayer++;
          } else {
            return null;
          }
        }
      }
      itemsGrid.push(itemGrid);
      itemsGridPos.push(itemGridPos);
      return ss(itemsGrid, itemsGridPos);
    }
    return ss(itemsGrid, itemsGridPos);
  }

  getClearPath() {
    this.solutionFound = false;
    this.zeroStack = new Array();
    this.zeroStackPos = new Array();
    this.arrClearPath = new Array();
    this.arrClearPathPosition = new Array();
    this.sumInStack = 0;

    let itemsGrid = [];
    let itemsGridPos = [];
    for(let x = 0; x < this.arrGrid.length; x++) {
      if(this.arrGrid[x].zeroValue !== 0) {
        itemsGrid.push(this.arrGrid[x].zeroValue);
        itemsGridPos.push(x);
      }
    }

    let resultClearPath = this.getZeroPath(itemsGrid, itemsGridPos);
    if(resultClearPath === null) {
      this.arrClearPath = [];
      this.arrClearPathPosition = [];
    } else {
      this.arrClearPath = resultClearPath[0];
      this.arrClearPathPosition = resultClearPath[1];
    }

    // console.log(this.arrClearPath)
    if(this.arrClearPath.length === 0) {
      this.zeroMessage = "No more Zeros !";
    }
  }

  selectCell(gridIndex) {
    if(this.arrGrid[gridIndex].zeroValue !== 0) {
      this.arrGrid[gridIndex].isSelected = !this.arrGrid[gridIndex].isSelected;
      if(this.arrGrid[gridIndex].isSelected) {
        this.zeroClickCount++;
        this.zeroSum += this.arrGrid[gridIndex].zeroValue;
      } else {
        this.zeroClickCount--;
        this.zeroSum -= this.arrGrid[gridIndex].zeroValue;
      }
      this.zeroMessage = "Sum: " + this.zeroSum.toString();
      this.checkZeroSum();
    }
  }

  checkZeroSum() {
    let clearFlash:number[] = [];
    if(this.zeroSum === 0) {
      if(this.zeroClickCount > 2) {
        for(let x = 0; x < this.arrGrid.length; x++) {
          if(this.arrGrid[x].isSelected) {
            clearFlash.push(x);
            this.arrGrid[x].isSelected = false;
          }
        }
        this.arrClearFlash = clearFlash;
        this.zeroMessage = "Zero !!!";
        setTimeout(() => {
          this.zeroMoves += this.zeroClickCount;
          for(let i = 0; i < this.arrClearFlash.length; i++) {
            this.arrGrid[this.arrClearFlash[i]].zeroValue = 0;
            this.arrEmptyCells.push(this.arrClearFlash[i]);
          }
          this.arrClearFlash = [];
          this.zeroSum = 0;
          this.zeroClickCount = 0;
          this.zeroMessage = "";
          this.getClearPath();
          if(this.isInfinite) {
            setTimeout(() => { this.getNewZeros(); }, 1000);
          }
        }, 2000);
      } else if (this.zeroClickCount === 2) {
        this.zeroMessage = "Select atleast 3 cells !";
      }
    }
  }

  getNewZeros() {
    let tempCell:ZeroCell = null;
    let minValue = this.arrDifficulty[this.selectedDifficulty].minValue;
    let maxValue = this.arrDifficulty[this.selectedDifficulty].maxValue;
    for(let i = 0; i < this.arrEmptyCells.length; i++){
      tempCell = new ZeroCell();
      tempCell.zeroValue = this.getZeroValue(minValue, maxValue);
      this.arrGrid[this.arrEmptyCells[i]] = tempCell;
    }
    this.showNewZeros = true;
    if(this.arrClearPath.length === 0) {
      this.getClearPath();
    }
    
    setTimeout(() => {
      this.arrEmptyCells = [];
      this.showNewZeros = false;
    }, 1000);
    
  }

  showHint() {
    if(this.helpCounter > 0) {
      if(this.arrClearPath.length > 0) {
        this.flashHint = true;
        this.helpCounter--;
        setTimeout(() => {
          this.flashHint = false;
        }, 2000);
      } else {
        this.zeroMessage = "No more Zeros";
      }
    }
  }

  setDifficulty(selectedDifficulty) {
    this.selectedDifficulty = selectedDifficulty;
  }

  showSettings() {
    this.openPopup = this.modalService.open(this.popupSettings, {});
  }

  showHighscore() {
    this.openPopup = this.modalService.open(this.popupHighscore, {});
  }

  showHelp() {
    this.openPopup = this.modalService.open(this.popupHelp, {});
  }

  resetStats() {
    this.persistData.zeroStats = new PersistDataStats();
    this.savePersistData(true);
  }

}
