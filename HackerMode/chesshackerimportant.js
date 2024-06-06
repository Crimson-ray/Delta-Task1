const gameBoard=document.querySelector("#gameboard")
const playerDisplay=document.querySelector("#player")
const infoDisplay=document.querySelector("#info-display")
const angleA=[0,0]//[R,S]
const angleB=[0,0]//[R,S]
const TimerA=[5,0]
const TimerB=[5,0]
const pieces=[
    titan,tank,ricochet,semi,canon,'','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','',canon,semi,ricochet,tank,titan
]
const shootSound = new Audio("canon-sound.mp3");
const winSound = new Audio("game-end.mp3");
const historyA=document.querySelector(".historyA")
const historyB=document.querySelector(".historyB")
let movesOfA=[]
let movesOfB=[]
let undoedMoveOfA=[]
let undoedMoveOfB=[]
let row=8
let col=0
let currentPosition=null
let b=null
let clock=null
let MinutesA=TimerA[0]
let SecondsA=TimerA[1]
let MinutesB=TimerB[0]
let SecondsB=TimerB[1]
let TimeA=MinutesA*60+SecondsA
let TimeB=MinutesB*60+SecondsB
let moveBullet=null
let selectedSquare = null
let isClickable = true
let isPaused = false
let tempSquare=null
let pieceId=null
let isSwap=false
let isShooting=false
let board=null
let currentState=[]
let undoedstate=[]
let states=[]
let previousState=[]
let isUndo=false
let positionArray=[]
let fullGame=[]
//replay1
/*function replayMoves(){
    document.querySelector(".winner").remove()
       let gameStates= JSON.parse(localStorage.getItem('fullGame'));
       replayStates=Array.from(gameStates)
       let len=replayStates.length
       for(let i=0;i<len;i++){
         let state=replayStates[i]
         setTimeout(()=>{
            gameBoard.innerHTML=state
         },600*i)
       }
       }
       */
// Store state in local storage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(states));
    localStorage.setItem('historyA',JSON.stringify(historyA.innerHTML))
    localStorage.setItem('historyB',JSON.stringify(historyB.innerHTML))
    localStorage.setItem('fullGame',JSON.stringify(fullGame))
}
//Store moves
function registerMove(move){
    positionArray=[]
    let mover=document.querySelector("#player").innerHTML
    if(mover==="A"){
        movesOfA.push(move)
    }
    else{
        movesOfB.push(move)
    }
    document.querySelectorAll(".square").forEach(s=>{
        if(s.firstChild){
           positionArray.push( [s.firstChild.id,s.dataset.player])
        }
        else{
            positionArray.push("")
        }
    })
}
//function to show Moves
function showMovesA(){
    stopTimer()
    historyA.classList.add("displayHistory")
    const restart=document.createElement("button")
    restart.classList.add("back")
    restart.innerHTML="BACK"
    restart.addEventListener("click",backA)
    historyA.appendChild(restart)
}
function showMovesB(){
    stopTimer()
    historyB.classList.add("displayHistory")
    const restart=document.createElement("button")
    restart.classList.add("back")
    restart.innerHTML="BACK"
    restart.addEventListener("click",backB)
    historyB.appendChild(restart)
}
function backA(){
    historyA.classList.remove("displayHistory")
    historyA.querySelector("button").remove()
    startTimer()
}
function backB(){
    historyB.classList.remove("displayHistory")
    historyB.querySelector("button").remove()
    startTimer()
}
// History of Moves
function displayHistory(){
    historyA.innerHTML="<p>MOVES OF A</p>"
    historyB.innerHTML="<p>MOVES OF B</p>"
    if(movesOfA.length>0){
    movesOfA.forEach(move=>{
        let p=document.createElement("p")
        p.innerText=move
        historyA.appendChild(p)
    })}
    if(movesOfB.length>0){
    movesOfB.forEach(move=>{
        let p=document.createElement("p")
        p.innerText=move
        historyB.appendChild(p)
    })}
}
// Storing State
function storeState(){
    board=document.querySelector("#gameboard").innerHTML
    currentState=[[...angleA],[...angleB],board]
    states.push([...currentState])
}
// CREATING BOARD
function createBoard(){
    document.querySelector(".timer-A").innerText="A  5:00"
    document.querySelector(".timer-B").innerText="B  5:00"
    pieces.forEach((piece,i)=>{
        if(col>7){
            col=0
            row=row-1
        }
        const square=document.createElement("div")
        square.classList.add("square")
        square.innerHTML=piece
        if(piece===canon){
            square.innerHTML=`${square.innerHTML}${bullet}`
        }
        square.setAttribute("square-row",`${row}`)
        square.setAttribute("square-col",`${col}`)
        square.classList.add("color") 
        gameBoard.append(square)
        if(i>=0 && i<=4){
            square.firstChild.firstChild.classList.add("green");
            square.dataset.player="A"
        }
        else if(i>=59 && i<=63){
            square.firstChild.firstChild.classList.add("black");
            square.dataset.player="B"
        }
        else{
            square.dataset.player=""
        }
        if (square.querySelector('.bullet')) {
            square.querySelector('.bullet').classList.add((i <= 4) ? "greenb" : "blackb");
        }
        col=col+1
    })
    storeState()
}
// Reset Board
function resetBoard(BOARD){
    clearPaths()
    removeButtons()
    angleA[0]=previousState[0][0]
    angleA[1]=previousState[0][1]
    angleB[0]=previousState[1][0]
    angleB[1]=previousState[1][1]
    document.querySelector("#player").innerHTML=document.querySelector("#player").innerHTML==="A"?"B":"A"
    document.querySelector("#gameboard").innerHTML=BOARD
}
//redo Board
function redoBoard(BOARD){
    clearPaths()
    removeButtons()
    angleA[1]=undoedstate[0][1]
    angleA[0]=undoedstate[0][0]
    angleB[0]=undoedstate[1][0]
    angleB[1]=undoedstate[1][1]
    document.querySelector("#player").innerHTML=document.querySelector("#player").innerHTML==="A"?"B":"A"
    document.querySelector("#gameboard").innerHTML=BOARD
}

// TIMER
    function startTimer(){
        if(clock===null){
        clock= setInterval(updateTime,1000)
        clock
        }
    }
    function stopTimer(){
        clearInterval(clock)
        clock=null
    }
    function updateTime() {
        if(isPaused){return}
        let pa = document.querySelector("#player").innerText;
        
        if (pa === "A") {
            if (TimeA > 0) {
                TimeA--;
                updateTimerDisplay(TimeA, ".timer-A", TimerA,"A");
            }
            else{
                stopTimer()
                saveGameState()
                gameOver = true;
                isClickable = false;
                won="B"
                winSound.play()
                displayWinner(won)
                
            }
        } else {
            if (TimeB > 0) {
                TimeB--;
                updateTimerDisplay(TimeB, ".timer-B", TimerB,"B");
            }
            else{
                stopTimer()
                saveGameState()
                gameOver = true;
                isClickable = false;
                won="A"
                winSound.play()
                displayWinner(won)
                
            }
        }
    }
    
    function updateTimerDisplay(time, selector, timerArray,p) {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        seconds = (seconds < 10) ? '0' + seconds : seconds;
        document.querySelector(selector).innerHTML = `${p}  ${minutes}:${seconds}`;
    }
    document.querySelector(".reset").addEventListener("click",reset)
    document.querySelector(".pause").addEventListener("click",pause)
    document.querySelector(".undo").addEventListener("click",undo)
    document.querySelector(".redo").addEventListener("click",redo)
    document.querySelector(".HistoryA").addEventListener("click",showMovesA)
    document.querySelector(".HistoryB").addEventListener("click",showMovesB)
// Reset Button
function reset(){
    clearInterval(clock)
    clearInterval(moveBullet)
    undoedMoveOfA=[]
    movesOfB=[]
    movesOfA=[]
    undoedMoveOfB=[]
    row=8
    col=0
    currentPosition=null
    b=null
    clock=null
    MinutesA=TimerA[0]
    SecondsA=TimerA[1]
    MinutesB=TimerB[0]
    SecondsB=TimerB[1]
    TimeA=MinutesA*60+SecondsA
    TimeB=MinutesB*60+SecondsB
    moveBullet=null
    selectedSquare = null
    isClickable = true
    isPaused = false
    tempSquare=null
    pieceId=null
    isSwap=false
    isShooting=false
    board=null
    currentState=[]
    undoedstate=[]
    states=[]
    previousState=[]
    isUndo=false
    angleA[0]=0
    angleA[1]=0
    angleB[0]=0
    angleB[1]=0
    clearPaths()
    document.querySelector("#player").innerHTML="A"
    document.querySelector("#gameboard").innerHTML=""
    historyA.innerHTML="<p>MOVES OF A</p>"
    historyB.innerHTML="<p>MOVES OF B</p>"
    createBoard()
    startTimer()
}
// pauseButton

function pause(){
        isPaused = !isPaused;
        if (!isPaused) {
            startTimer(); 
            document.querySelector('.pause').innerText = 'Pause'
            document.querySelector('.reset').disabled=false
            document.querySelector('.undo').disabled=false
            document.querySelector('.redo').disabled=false
        } else {
            if(isSwap){isClickable=true;isSwap=false;}
            removeButtons()
            clearPaths()
            stopTimer(); 
            document.querySelector('.pause').innerText = 'Resume'
            document.querySelector(".reset").disabled=true
            document.querySelector('.undo').disabled=true
            document.querySelector('.redo').disabled=true
        }
}

// Undo Button
function undo(){
    if(isUndo||isShooting){return}
    if(states.length>1){
        isUndo=true
        currentState=states.pop()
        let l=states.length-1
        previousState=states[l]
        board=previousState[2]
        resetBoard(board)
        undoedstate=[...currentState]
        if(playerDisplay.innerHTML==="A"){undoedMoveOfA[0]=movesOfA.pop()}
        else if(playerDisplay.innerHTML==="B"){undoedMoveOfB[0]=movesOfB.pop()}
        displayHistory()
        isClickable=true
        isSwap=false
    }
}
// Redo Button
function redo(){
    if(!isUndo){return}
    board=undoedstate[2]
    redoBoard(board)
    states.push([...undoedstate])
    if(playerDisplay.innerHTML==="A"){
        movesOfB.push(undoedMoveOfB[0])
    }
    else if(playerDisplay.innerHTML==="B"){
        movesOfA.push(undoedMoveOfA[0])
    }
    displayHistory()
    isUndo=false
    isClickable=true
    isSwap=false
}
createBoard()
startTimer()
gameBoard.addEventListener("click", function (event) {
    if (!isClickable || isPaused) return;
    console.log(event)
    event.parentElement
    const target = event.target;
    const currentPlayer = playerDisplay.innerText;
    if (selectedSquare) {
        selectedSquare.classList.remove("selected");
        clearPaths();
        removeButtons();
    }
    if (target.classList.contains("piece") &&  target.parentElement && target.parentElement.dataset.player === currentPlayer) {
        fullGame.push(gameBoard.innerHTML)
        selectedSquare = target.parentElement;
        selectedSquare.classList.add("selected");
        showPaths(selectedSquare);
    }
});
// Swap
function Swap(Event){
    isClickable=false
    isSwap=true
    clearPaths();
    removeButtons()
    let cancel =document.createElement("button")
    cancel.innerText="Cancel"
    cancel.classList.add("button")
    cancel.addEventListener("click",Cancel)
    let div= document.querySelector(".button-container")
    div.append(cancel)
    document.querySelectorAll(".square").forEach(s=>{
        let RS=parseInt(Event.getAttribute("square-row"));
        let CS=parseInt(Event.getAttribute("square-col"));
        let rowr= parseInt(s.getAttribute("square-row"));
        let colr= parseInt(s.getAttribute("square-col"));
        if(((rowr!==RS)||(colr!==CS))&&(s.innerHTML !=="" &&  s.querySelector(".piece").id !=="titan" && s.querySelector(".piece").id !=="canon") && (s.innerHTML!==Event.innerHTML)){
            s.classList.add("path")
            s.addEventListener("click",movePiece,{once:true})
        }
    })
    fullGame.push(gameBoard.innerHTML)
}
function Cancel(){
    isClickable=true
    isSwap=false
    clearPaths()
    removeButtons()
}
// displaying
function showPaths(square) {
    let row = parseInt(square.getAttribute("square-row"));
    let col = parseInt(square.getAttribute("square-col"));
    let positions = [];
    pieceId = square.querySelector(".piece").id;

    if (pieceId === "canon") {
        positions = [[row, col - 1], [row, col + 1]];
    } else {
        positions = [
            [row, col - 1], [row, col + 1],
            [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
            [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
        ];
    }
    if(pieceId==="ricochet" || pieceId==="semi")
        {
            if(pieceId==="ricochet"){
            let left =document.createElement("button")
            left.innerText="Left"
            left.classList.add("button")
            left.addEventListener("click",()=>{rotateLeft(square)})
            let right =document.createElement("button")
            right.innerText="Right"
            right.classList.add("button")
            right.addEventListener("click",()=>{rotateRight(square)})
            let swap =document.createElement("button")
            swap.innerText="Swap"
            swap.classList.add("button")
            swap.addEventListener("click",(e)=>{Swap(square)})
            let div= document.querySelector(".button-container")
            div.append(left,right,swap)
        }
        else{
            let left =document.createElement("button")
            left.innerText="Left"
            left.classList.add("button")
            left.addEventListener("click",()=>{rotateLeft(square)})
            let right =document.createElement("button")
            right.innerText="Right"
            right.classList.add("button")
            right.addEventListener("click",()=>{rotateRight(square)})
            let div= document.querySelector(".button-container")
            div.append(left,right)
        }
    }
    positions.forEach(position => {
        let [posRow, posCol] = position;
        let pathSquare = document.querySelector(`.square[square-row="${posRow}"][square-col="${posCol}"]`);
        if (pathSquare && !pathSquare.innerHTML) {
            pathSquare.classList.add("path");
            pathSquare.addEventListener("click", movePiece, { once: true });
        }
    });
    fullGame.push(gameBoard.innerHTML)
}
function clearPaths() {
    document.querySelectorAll(".path").forEach(path => {
        path.classList.remove("path");
        path.replaceWith(path.cloneNode(true)); 
    });
}

function movePiece(event) {
    const targetSquare = event.currentTarget;
    if(isUndo){isUndo=false}
    if(isSwap){
        let swappedwith=targetSquare.querySelector(".piece").id 
        let swappedplayer=targetSquare.dataset.player;
        tempSquare=targetSquare.innerHTML
        targetSquare.innerHTML = selectedSquare.innerHTML;
        selectedSquare.innerHTML =tempSquare
        let tempPlayer=targetSquare.dataset.player
        targetSquare.dataset.player = selectedSquare.dataset.player
        selectedSquare.dataset.player=tempPlayer
        isSwap=false
        isClickable=true
        let move=`ricochet-${playerDisplay.innerHTML} swapped with ${swappedwith}-${swappedplayer}`
        registerMove(move)
    }
    else{
    if (selectedSquare && targetSquare.classList.contains("path")) {
        targetSquare.innerHTML = selectedSquare.innerHTML;
        selectedSquare.innerHTML ="";
        targetSquare.dataset.player = selectedSquare.dataset.player;
        selectedSquare.dataset.player="";
        let startr=selectedSquare.getAttribute("square-row")
        let startc=selectedSquare.getAttribute("square-col")
        let endr=targetSquare.getAttribute("square-row")
        let endc=targetSquare.getAttribute("square-col")
        let move=`${pieceId} moved from (${startr},${startc}) to (${endr},${endc})`
        registerMove(move)
    }
    }
    clearPaths();
    removeButtons();
    fullGame.push(gameBoard.innerHTML)
    displayHistory()
    shoot()
    selectedSquare.classList.remove("selected");
    selectedSquare = null;
}
function removeButtons(){
    document.querySelectorAll(".button").forEach(button=>{
        button.replaceWith(button.cloneNode(true)); 
    })
    document.querySelector(".button-container").innerHTML=""
}
function Rotation() {
    clearPaths();
    removeButtons();
    fullGame.push(gameBoard.innerHTML)
    displayHistory()
    shoot();
    if (selectedSquare) {
        selectedSquare.classList.remove("selected");
        selectedSquare = null;
    }
    console.log(angleA, angleB);
}
function rotateRight(square){
    if(isUndo){isUndo=false}
    target=square.firstChild
    if(target.id==="ricochet"){
      if(square.dataset.player==="A"){
        target.style.rotate=`${angleA[0]+135}deg`
        angleA[0]=angleA[0]+90
        if(angleA[0]>=180){
            angleA[0]=0
        }
      }
      if(square.dataset.player==="B"){
        target.style.rotate=`${angleB[0]+135}deg`
        angleB[0]=angleB[0]+90
        if(angleB[0]>=180){
            angleB[0]=0
        }
      }
      let move=`ricochet-${playerDisplay.innerHTML} rotated right`
      registerMove(move)
    }
    else{
         if(square.dataset.player==="A"){
            target.style.rotate=`${angleA[1]+90}deg`
            angleA[1]=angleA[1]+90
            if(angleA[1]>=360){
                angleA[1]=angleA[1]-360
            }
          }
          if(square.dataset.player==="B"){
            target.style.rotate=`${angleB[1]+90}deg`
            angleB[1]=angleB[1]+90
            if(angleB[1]>=360){
                angleB[1]=angleB[1]-360
            }
          }
          let move=`semi-${playerDisplay.innerHTML} rotated right`
          registerMove(move)
     }
     Rotation()
}
function rotateLeft(square){
    if(isUndo){isUndo=false}
    target=square.firstChild
    if(target.id==="ricochet"){
      if(square.dataset.player==="A"){
        target.style.rotate=`${angleA[0]+315}deg`
        angleA[0]=angleA[0]+90
        if(angleA[0]>=180){
            angleA[0]=0
        }
      }
      if(square.dataset.player==="B"){
        target.style.rotate=`${angleB[0]+315}deg`
        angleB[0]=angleB[0]+90
        if(angleB[0]>=180){
            angleB[0]=0
        }
      }
      let move=`ricochet-${playerDisplay.innerHTML} rotated left`
      registerMove(move)
    }
    else{
         if(square.dataset.player==="A"){
            target.style.rotate=`${angleA[1]+270}deg`
            angleA[1]=angleA[1]+270
            if(angleA[1]>=360){
                angleA[1]=angleA[1]-360
            }
          }
          if(square.dataset.player==="B"){
            target.style.rotate=`${angleB[1]+270}deg`
            angleB[1]=angleB[1]+270
            if(angleB[1]>=360){
                angleB[1]=angleB[1]-360
            }
          }
          let move=`semi-${playerDisplay.innerHTML} rotated left`
          registerMove(move)
     }
     Rotation()
}

// shooting 
function shoot(){
    isShooting=true
    stopTimer()
    let nextPosition=null
    let currentPosition=null
    if(playerDisplay.innerText==="A"){
        b=document.querySelector(".greenb")
        b.classList.add("displayBullet")
    }
    else{
        b=document.querySelector(".blackb")
        b.classList.add("displayBullet")
    }
    let speedy=(playerDisplay.innerText==="A")?-1:1;
    let speedx=0;
    currentPosition=b.parentElement
    shootSound.play()
    shootSound.currentTime=0
    let canon=currentPosition
    moveBullet=setInterval(shooter,200)
    function shooter(){
        if(speedy===-1){
            b.style.rotate="180deg"
        }
        if(speedx===1){
            b.style.rotate="90deg"
        }
        if(speedx===-1){
            b.style.rotate="270deg"
        }
        if(speedy===1){
            b.style.rotate="0deg"
        }
        if (isPaused) return;
        isClickable=false
        fullGame.push(gameBoard.innerHTML)
        row=parseInt(currentPosition.getAttribute("square-row"))
        col=parseInt(currentPosition.getAttribute("square-col"))
        nextPosition=document.querySelector(`.square[square-row="${row+speedy}"][square-col="${col+speedx}"]`);
        if(nextPosition && nextPosition.innerHTML==="")
            {
                nextPosition.appendChild(b)
                let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                if (bulletInCurrentPosition) {
                bulletInCurrentPosition.remove();
            }
                currentPosition=nextPosition
                moveBullet
            }
            
        else{
            
              if(nextPosition && (nextPosition.firstChild.id==="canon")){
                     let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                     if (bulletInCurrentPosition) {
                     bulletInCurrentPosition.remove();
                     canon.appendChild(b)
                     clearInterval(moveBullet)
                     playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                     b.classList.remove("displayBullet")
                     storeState()
                     isShooting=false
                     isClickable=true
                     startTimer()}
                
             }
             else if(nextPosition &&  nextPosition.firstChild.id==="tank"){
                if(speedx===1 || speedx===-1){
                    
                        nextPosition.appendChild(b)
                        let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                        if (bulletInCurrentPosition) {
                        bulletInCurrentPosition.remove();
                    }
                    currentPosition=nextPosition
                    moveBullet

                }
                else{
                    let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                     if (bulletInCurrentPosition) {
                     bulletInCurrentPosition.remove();
                     canon.appendChild(b)
                     clearInterval(moveBullet)
                     playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                     b.classList.remove("displayBullet")
                     storeState()
                     isShooting=false
                     isClickable=true
                     startTimer()
                }
                }
             }
                else if(nextPosition &&  nextPosition.firstChild.id==="semi")
                    {
                        nextPosition.appendChild(b)
                        let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                        if (bulletInCurrentPosition) {
                        bulletInCurrentPosition.remove();
                        }
                        currentPosition=nextPosition
                        if(nextPosition.dataset.player==="A"){
                            let angle=angleA[1]
                            let temp=0
                                if(angle===0 && (speedy===1|| speedx===1))
                                    {
                                        temp=speedy
                                        speedy=-speedx
                                        speedx=-temp
                                        moveBullet
                                    }
                                else if(angle===90 && (speedy===-1|| speedx===1))
                                    {
                                        temp=speedy
                                        speedy=speedx
                                        speedx=temp
                                        moveBullet
                                    }
                                    else if(angle===180 && (speedy===-1|| speedx===-1))
                                    {
                                        temp=speedy
                                        speedy=-speedx
                                        speedx=-temp
                                        moveBullet
                                    }
                                    else if(angle===270 && (speedy===1|| speedx===-1))
                                    {
                                        temp=speedy
                                        speedy=speedx
                                        speedx=temp
                                        moveBullet
                                    }
                                    else{
                                        nextPosition.innerHTML=""
                                        nextPosition.dataset.player=""
                                        canon.appendChild(b)
                                        clearInterval(moveBullet)
                                        playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                                        b.classList.remove("displayBullet")
                                        fullGame.push(gameBoard.innerHTML)
                                        storeState()
                                        isShooting=false
                                        isClickable=true
                                        startTimer()    
                                    }
                         
                        }
                        else if(nextPosition.dataset.player==="B"){
                            let angle=angleB[1]
                            let temp=0
                            if(angle===0 && (speedy===1|| speedx===1))
                                {
                                    temp=speedy
                                    speedy=-speedx
                                    speedx=-temp
                                    moveBullet
                                }
                            else if(angle===90 && (speedy===-1|| speedx===1))
                                {
                                    temp=speedy
                                    speedy=speedx
                                    speedx=temp
                                    moveBullet
                                }
                                else if(angle===180 && (speedy===-1|| speedx===-1))
                                {
                                    temp=speedy
                                    speedy=-speedx
                                    speedx=-temp
                                    moveBullet
                                }
                                else if(angle===270 && (speedy===1|| speedx===-1))
                                {
                                    temp=speedy
                                    speedy=speedx
                                    speedx=temp
                                    moveBullet
                                }
                                else{
                                    nextPosition.innerHTML=""
                                    nextPosition.dataset.player=""
                                    positionArray=[]
                                    document.querySelectorAll(".square").forEach(s=>{
                                        if(s.firstChild){
                                           positionArray.push( [s.firstChild.id,s.dataset.player])
                                        }
                                        else{
                                            positionArray.push("")
                                        }
                                    })
                                    canon.appendChild(b)
                                    clearInterval(moveBullet)
                                    playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                                    b.classList.remove("displayBullet")
                                    fullGame.push(gameBoard.innerHTML)
                                    storeState()
                                    isShooting=false
                                    isClickable=true
                                    startTimer()    
                                }
                            
                        }
                    }
                else if(nextPosition &&  nextPosition.firstChild.id==="ricochet"){
                    {
                        nextPosition.appendChild(b)
                        let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                        if (bulletInCurrentPosition) {
                        bulletInCurrentPosition.remove();
                        }
                        currentPosition=nextPosition
                        let temp=0
                        if(nextPosition.dataset.player==="A"){
                            if(angleA[0]===0){
                                temp=speedy
                                speedy=-speedx
                                speedx=-temp
                            }
                            else if(angleA[0]===90){
                                temp=speedy
                                speedy=speedx
                                speedx=temp
                            }
                        }
                        else
                        {
                            if(angleB[0]===0){
                                temp=speedy
                                speedy=-speedx
                                speedx=-temp
                            }
                            else if(angleB[0]===90){
                                temp=speedy
                                speedy=speedx
                                speedx=temp
                            }
                        }
                        moveBullet
                    }
                }
                else if (nextPosition && nextPosition.firstChild.id === "titan") {
                    nextPosition.appendChild(b)
                    setTimeout(()=>{
                        fullGame.push(gameBoard.innerHTML)
                        clearInterval(moveBullet);
                        storeState()
                        gameOver = true;
                        isClickable = false;
                        let lost = nextPosition.dataset.player;
                        let won = (lost === "A") ? "B" : "A";
                        console.log(won, lost);
                        saveGameState()
                        winSound.play()
                        displayWinner(won);
                    },50)
                   
                }
                else
                   { 
                       let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                       if (bulletInCurrentPosition) {
                       bulletInCurrentPosition.remove();
                       canon.appendChild(b)
                       clearInterval(moveBullet)
                       b.classList.remove("displayBullet")
                       storeState()
                       clearInterval(moveBullet)}
                       playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                       isShooting=false
                       isClickable=true
                       startTimer()
                  }
                
            
    }  
}
}
function re(){
    console.log("restart")
    document.querySelector(".winner").remove()
    reset()
}
function displayWinner(winner) {
    const win = document.createElement('div')
    win.classList.add("winner")
    const restart=document.createElement("button")
    restart.classList.add("restart")
    restart.innerHTML="PLAY AGAIN"
    restart.addEventListener("click",re)
    win.id = 'winner-message'
    win.innerHTML = `<h1>${winner} WON THE GAME</h1>`;
    document.body.appendChild(win)
    win.appendChild(restart)
}
