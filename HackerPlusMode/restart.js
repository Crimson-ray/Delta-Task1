const gameBoard=document.querySelector("#gameboard")
const playerDisplay=document.querySelector("#player")
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
let shufflepiece=[
    titan,tank,ricochet,semi,'','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','',semi,ricochet,tank,titan
]
const hitSound = new Audio("C:\\Users\\jd200\\Music\\bullet hit.mp3");
const shootSound = new Audio("C:\\Users\\jd200\\Music\\canon-sound.mp3");
shootSound.preload="auto"
const winSound = new Audio("C:\\Users\\jd200\\Music\\game-end.mp3");
const destroy = new Audio("C:\\Users\\jd200\\Music\\Bullet destroys.mp3");
const passBy = new Audio("C:\\Users\\jd200\\Music\\bullet pass by.mp3");
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
let won=null
let newpiece=[]
let temp1=[]
let temp2=[]
let replays= [];
let skipSpellOf = {
    "A": false,
    "B": false
};
//new
let PassThroughOf = {
    "A": false,
    "B": false
};
let FreezeOf={
    "A": false,
    "B": false
}
let freeze=false;
let freezeId=null
let freezeEnabled=false
let freezeDisabled=false

let skipEnabled=false;
let skipDisabled=false;
let isPassThroughEnabled=false;
let isPassThroughDisabled=false;
let rotated=0;
let canPassThrough=false;
let skipOn=false;
// window resizing
/*window.onresize=function(){
    document.querySelectorAll("#canon").forEach((canon,i)=>{
        let startTop=`${canon.parentElement.offsetTop+20}px`
        let startLeft=`${canon.parentElement.offsetLeft+20}px`
        if(i===0)
            {
                document.querySelector('.greenb').style.top=`${startTop}`
                document.querySelector('.greenb').style.left=`${startLeft}`
            }
            else{
                document.querySelector('.blackb').style.top=`${startTop}`
                document.querySelector('.blackb').style.left=`${startLeft}`
            }
    })
}
 */   
// spells
function enableSkip(player) {
    skipSpellOf[player] = true;
    document.querySelector(`#spellSelect${player} option[value='Skip']`).disabled = false;
}

function enablePassThrough(player) {
    PassThroughOf[player] = true;
    document.querySelector(`#spellSelect${player} option[value='PassThrough']`).disabled = false;
}

function enableFreeze(player) {
    FreezeOf[player] = true;
    document.querySelector(`#spellSelect${player} option[value='Freeze']`).disabled = false;
}

function disableSkip(player) {
    skipSpellOf[player] = false;
    document.querySelector(`#spellSelect${player} option[value='Skip']`).disabled = true;
    document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
}

function disablePassThrough(player) {
    PassThroughOf[player] = false;
    document.querySelector(`#spellSelect${player} option[value='PassThrough']`).disabled = true;
    document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
    canPassThrough = false;
    document.querySelector(".undo").disabled = false;
}

function disableFreeze(player) {
    FreezeOf[player] = false;
    document.querySelector(`#spellSelect${player} option[value='Freeze']`).disabled = true;
    document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
    freezeId = null;
    document.querySelector(".undo").disabled = false;
}

function castspells(spell, player) {
    if (spell === "Skip" && canPassThrough && player !== playerDisplay.innerHTML ) {
        canPassThrough = false;
        enablePassThrough(playerDisplay.innerHTML);
        document.querySelector(".undo").disabled = false;
        document.querySelector(`#spellSelect${playerDisplay.innerHTML} option[value='']`).selected = true;
    }

    if (spell === "Skip" && skipSpellOf["A"] && skipSpellOf["B"] && !isShooting) {
        if (player !== playerDisplay.innerHTML) {
            playerDisplay.innerHTML = player;
            disableSkip(player);
            clearPaths();
            removeButtons();
            skipOn = true;
        } else {
            alert("Cannot skip now");
            document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
        }
    } else if ((spell === "Skip" && skipSpellOf[playerDisplay.innerHTML]) || isShooting) {
        alert("Cannot skip now");
        document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
    } else if (spell === "Skip") {
        playerDisplay.innerHTML = player;
        disableSkip(player);
        clearPaths();
        removeButtons();
        skipOn = true;
    }

    if (spell === "PassThrough" && PassThroughOf["A"] && PassThroughOf["B"] && !isShooting) {
        if (player === playerDisplay.innerHTML) {
            canPassThrough = true;
            document.querySelector(".undo").disabled = true;
        } else {
            alert("Cannot PassThrough now");
            document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
        }
    } else if ((spell === "PassThrough" && !PassThroughOf[playerDisplay.innerHTML]) || isShooting) {
        alert("Cannot PassThrough now");
        document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
    } else if (spell === "PassThrough") {
        canPassThrough = true;
        document.querySelector(".undo").disabled = true;
    }

    if (spell === "Freeze" && FreezeOf["A"] && FreezeOf["B"] && !isShooting) {
        if (player !== playerDisplay.innerHTML) {
            freeze = true;
            while (!["canon", "ricochet", "tank", "titan", "semi"].includes(freezeId)) {
                freezeId = prompt("Enter Piece to freeze from [canon, ricochet, tank, titan, semi]");
            }
            clearPaths();
            removeButtons();
        } else {
            alert("Cannot Freeze now");
            document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
        }
    } else if ((spell === "Freeze" && FreezeOf[playerDisplay.innerHTML]) || isShooting) {
        alert("Cannot Freeze now");
        document.querySelector(`#spellSelect${player} option[value='']`).selected = true;
    } else if (spell === "Freeze") {
        freeze = true;
        while (!["canon", "ricochet", "tank", "titan", "semi"].includes(freezeId)) {
            freezeId = prompt("Enter Piece to freeze from [canon, ricochet, tank, titan, semi]");
        }
        clearPaths();
        removeButtons();
    }
}

function clearPaths() {
    // Implementation of clearPaths
    console.log("Paths cleared");
}

function removeButtons() {
    // Implementation of removeButtons
    console.log("Buttons removed");
}
// replay moves
function replayMoves() {
    clearReplay()
    document.querySelector(".winner").remove()
    let gameStates = JSON.parse(localStorage.getItem('fullGame'))
    let replayStates = Array.from(gameStates)
    let len = replayStates.length

    for (let i = 0; i < len; i++) {
        let state = replayStates[i];
        let timeout = setTimeout(() => {
            gameBoard.innerHTML = state
            if (i === len - 1) {
                displayWinner(won)
            }
        }, 600 * i)
        replays.push(timeout)
    }
}

function clearReplay() {
    replays.forEach(timeout => clearTimeout(timeout))
    replays = []
}
// Store state in local storage
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(states));
    localStorage.setItem('historyA',JSON.stringify(historyA.innerHTML))
    localStorage.setItem('historyB',JSON.stringify(historyB.innerHTML))
    localStorage.setItem('fullGame',JSON.stringify(fullGame))
}

// Stores moves
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
function shuffle(array) {  
    for (let i = array.length - 1; i> 0; i--) {  
    const j = Math.floor(Math.random() * (i + 1));  
    [array[i], array[j]] = [array[j], array[i]];  
    }  
    return array;  
    }  
shufflepiece=shuffle(shufflepiece)
shufflepiece.unshift(canon)
shufflepiece.push(canon)
function canonshuffle(sp){
    for(let i=0;i<8;i++){
        temp1.push(sp[i])
    }
    temp1=shuffle(temp1)
    for(let i=0;i<8;i++){
        sp[i]=temp1[i]
    }
    for(let i=56;i<64;i++){
        temp2.push(sp[i])
    }
    temp2=shuffle(temp2)
    for(let i=56;i<64;i++){
        sp[i]=temp2[i-56]
    }
    temp1=[]
    temp2=[]
    return sp
}
newpiece=canonshuffle(shufflepiece)
//Creating board
function createBoard(){
    document.querySelector(".timer-A").innerText="A  5:00"
    document.querySelector(".timer-B").innerText="B  5:00"
    let colouredpieces=[]
    newpiece.forEach((piece,i)=>{
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
        if(square.firstChild && !(colouredpieces.includes(square.firstChild.id)) ){
            square.firstChild.firstChild.classList.add("green");
            square.dataset.player="A"
            colouredpieces.push(square.firstChild.id)
            if (square.querySelector('.bullet')){
                square.querySelector('.bullet').classList.add("greenb");
                let startTop=`${square.offsetTop+20}px`
                let startLeft=`${square.offsetLeft+20}px`
                square.querySelector('.bullet').style.top=`${startTop}`
                square.querySelector('.bullet').style.left=`${startLeft}`
            }
        }
        else if(square.firstChild){
            square.firstChild.firstChild.classList.add("black");
            square.dataset.player="B"
            if (square.querySelector('.bullet')) {
                square.querySelector('.bullet').classList.add("blackb");
                let startTop=`${square.offsetTop+20}px`
                let startLeft=`${square.offsetLeft+20}px`
                square.querySelector('.bullet').style.top=`${startTop}`
                square.querySelector('.bullet').style.left=`${startLeft}`
            }
        }
        else{
            square.dataset.player=""
        }
        col=col+1
    })
    storeState()
    document.querySelector("#spellSelectA").addEventListener("change",(e)=>{
        const currentspell=e.target.value
        console.log(currentspell)
        castspells(currentspell,"A")
    })
    document.querySelector("#spellSelectB").addEventListener("change",(e)=>{
        const currentspell=e.target.value
        console.log(currentspell)
        castspells(currentspell,"B")
    })

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

// Timer
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
            gameOver = true;
            isClickable = false;
            saveGameState()
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
            gameOver = true;
            isClickable = false;
            saveGameState()
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
    clearReplay()
    clearInterval(clock)
    clearInterval(moveBullet)
    skipSpellOf = {
        "A": false,
        "B": false
    };
    PassThroughOf = {
        "A": false,
        "B": false
    };
    FreezeOf={
        "A": false,
        "B": false
    }
    skipEnabled=false
    skipDisabled=false
    isPassThroughEnabled=false;
    isPassThroughDisabled=false;
    canPassThrough=false;
    freeze=false;
    freezeId=null
    freezeEnabled=false
    freezeDisabled=false
    rotated=0
    undoedMoveOfA=[]
    movesOfB=[]
    movesOfA=[]
    replays = []
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
    fullGame=[]
    positionArray=[]
    isUndo=false
    angleA[0]=0
    angleA[1]=0
    angleB[0]=0
    angleB[1]=0
    won=null
    skipOn=false;
    clearPaths()
    document.querySelector("#player").innerHTML="A"
    document.querySelector("#gameboard").innerHTML=""
    historyA.innerHTML="<p>MOVES OF A</p>"
    historyB.innerHTML="<p>MOVES OF B</p>"
    document.querySelector("#spellSelectA option[value='Skip']").disabled = true;
    document.querySelector("#spellSelectA option[value='']").selected = true;
    document.querySelector("#spellSelectB option[value='Skip']").disabled = true;
    document.querySelector("#spellSelectB option[value='']").selected = true;
    shufflepiece=[
        titan,tank,ricochet,semi,'','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','',semi,ricochet,tank,titan
    ]
    shufflepiece=shuffle(shufflepiece)
    shufflepiece.push(canon)
    shufflepiece.unshift(canon)
    newpiece=canonshuffle(shufflepiece)
    disablePassThrough("A")
    disablePassThrough("B")
    disableFreeze("A")
    disableFreeze("B")
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
            if(!canPassThrough)
            {document.querySelector('.undo').disabled=false}
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
    if(isUndo||isShooting || skipOn || freeze){return}
    if(states.length>1){
        isUndo=true
        currentState=states.pop()
        let l=states.length-1
        previousState=states[l]
        board=previousState[2]
        resetBoard(board)
        if(skipEnabled){
            disableSkip(playerDisplay.innerHTML)
            skipDisabled=true;
        }
        if(isPassThroughEnabled){
            disablePassThrough(playerDisplay.innerHTML)
            isPassThroughDisabled=true;
        }
        if(freezeEnabled){
            disableFreeze(playerDisplay.innerHTML)
            freezeDisabled=true;
        }
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
    if(!isUndo || skipOn || freeze){return}
    board=undoedstate[2]
    if(skipDisabled===true){
        enableSkip(playerDisplay.innerHTML)
        skipDisabled=false
    }
    if(isPassThroughDisabled){
        enablePassThrough(playerDisplay.innerHTML)
        isPassThroughDisabled=false
    }
    if(freezeDisabled){
        enableFreeze(playerDisplay.innerHTML)
        freezeDisabled=false;
    }
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
startTimer()
createBoard()
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
    if(freeze && target.classList.contains("piece") && target.id=== freezeId ){
        return
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
    if(freeze && freezeId===null){
        freeze=false;
    }
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
        if (selectedSquare.querySelector('.bullet')) {
            let startTop=`${targetSquare.offsetTop+20}px`
            let startLeft=`${targetSquare.offsetLeft+20}px`
            selectedSquare.querySelector('.bullet').style.top=`${startTop}`
            selectedSquare.querySelector('.bullet').style.left=`${startLeft}`
        }
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
    skipOn=false;
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
    if(skipOn){
        skipOn=false;
   }
    if(freeze && freezeId===null){
        freeze=false;
    }
    target=square.firstChild
    if(target.id==="ricochet"){
      if(square.dataset.player==="A"){
        target.style.rotate=`${angleA[0]+90}deg`
        angleA[0]=angleA[0]+90
        if(angleA[0]>=180){
            angleA[0]=0
        }
      }
      if(square.dataset.player==="B"){
        target.style.rotate=`${angleB[0]+90}deg`
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
    if(skipOn){
        skipOn=false;
   }
    if(freeze && freezeId===null){
        freeze=false;
    }
    target=square.firstChild
    if(target.id==="ricochet"){
      if(square.dataset.player==="A"){
        target.style.rotate=`${angleA[0]+270}deg`
        angleA[0]=angleA[0]+90
        if(angleA[0]>=180){
            angleA[0]=0
        }
      }
      if(square.dataset.player==="B"){
        target.style.rotate=`${angleB[0]+270}deg`
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
function shoot(){
    if(freeze){
    disableFreeze((player.innerHTML==="A"?"B":"A"))
    }
    isShooting=true;
    skipEnabled=false;
    skipDisabled=false;
    isPassThroughDisabled=false;
    isPassThroughEnabled=false;
    freezeEnabled=false;
    freezeDisabled=false;
    rotated=0;
    stopTimer()
    let gameBoardWidth = gameBoard.offsetWidth;
    let gameBoardHeight = gameBoard.offsetHeight;
    let nextPosition = null;
    let currentPosition = null;
    let b = null;
    if (playerDisplay.innerText === "A") {
        b = document.querySelector(".greenb");
    } else {
        b = document.querySelector(".blackb");
    }
    let speedy=(playerDisplay.innerText==="A")?-1:1;
    let speedx=0;
    currentPosition = b.parentElement;
    let startTop = `${(currentPosition.offsetTop + (currentPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
    let startLeft = `${(currentPosition.offsetLeft + (currentPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
    b.style.top=`${startTop}`
    b.style.left=`${startLeft}`
    b.id="displayBullet";
    const canon = currentPosition;
    shootSound.play()
    shootSound.currentTime=0
    moveBullet=setInterval(shooter,150)
    function shooter(){
        if (isPaused) return;

        if (speedy === -1) b.style.transform = "rotate(180deg)";
        if (speedx === 1) b.style.transform = "rotate(90deg)";
        if (speedx === -1) b.style.transform = "rotate(270deg)";
        if (speedy === 1) b.style.transform = "rotate(0deg)";
        isClickable = false;
        fullGame.push(gameBoard.innerHTML);
        row=parseInt(currentPosition.getAttribute("square-row"))
        col=parseInt(currentPosition.getAttribute("square-col"))
        gameBoardWidth = gameBoard.offsetWidth;
        gameBoardHeight = gameBoard.offsetHeight
        nextPosition = document.querySelector(`.square[square-row="${row + speedy}"][square-col="${col + speedx}"]`);
        if ((nextPosition && nextPosition.innerHTML === "") || (canPassThrough && nextPosition && nextPosition.firstChild && nextPosition.firstChild.id !=="titan")) {
            if (speedy === 1 || speedy === -1) {
                b.style.top = `${(nextPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                b.style.left = `${(currentPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
            } else {
                b.style.top = `${(currentPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                b.style.left = `${(nextPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
            }
            currentPosition = nextPosition;
            moveBullet
    }
    else{
            
        if(nextPosition && (nextPosition.firstChild.id==="canon")){
               
               clearInterval(moveBullet)
               playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
               b.id=null
               b.style.top=`${startTop}`
               b.style.left=`${startLeft}`
               fullGame.push(gameBoard.innerHTML)
               storeState()
               isShooting=false
               isClickable=true
               startTimer()
        }

        else if(nextPosition &&  nextPosition.firstChild.id==="tank"){
          if(speedx===1 || speedx===-1){
            b.style.top = `${(currentPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
            b.style.left = `${(nextPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                currentPosition=nextPosition
                moveBullet
            }
          else{
            clearInterval(moveBullet)
            playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
            b.id=null
            b.style.top=`${startTop}`
            b.style.left=`${startLeft}`
            fullGame.push(gameBoard.innerHTML)
            storeState()
            isShooting=false
            isClickable=true
            startTimer()
          }
       }
       else if(nextPosition &&  nextPosition.firstChild.id==="semi")
              {
                if (speedy === 1 || speedy === -1) {
                    b.style.top = `${(nextPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(currentPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                } else {
                    b.style.top = `${(currentPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(nextPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                }
                currentPosition = nextPosition;
                  if(nextPosition.dataset.player==="A"){
                      let angle=angleA[1]
                      let temp=0
                          if(angle===0 && (speedy===1|| speedx===1))
                              {
                                  temp=speedy
                                  speedy=-speedx
                                  speedx=-temp
                                  rotated++
                                  if(rotated===2){
                                     enablePassThrough(playerDisplay.innerHTML)
                                     isPassThroughEnabled=true;
                                  }
                                  if(rotated===3){
                                    enableFreeze(playerDisplay.innerHTML)
                                    freezeEnabled=true;
                                 }
                                  moveBullet
                              }
                          else if(angle===90 && (speedy===-1|| speedx===1))
                              {
                                  temp=speedy
                                  speedy=speedx
                                  speedx=temp
                                  rotated++
                                  if(rotated===2){
                                    enablePassThrough(playerDisplay.innerHTML)
                                    isPassThroughEnabled=true;
                                 }
                                 if(rotated===3){
                                    enableFreeze(playerDisplay.innerHTML)
                                    freezeEnabled=true;
                                 }
                                  moveBullet
                              }
                              else if(angle===180 && (speedy===-1|| speedx===-1))
                              {
                                  temp=speedy
                                  speedy=-speedx
                                  speedx=-temp
                                  rotated++
                                  if(rotated===2){
                                    enablePassThrough(playerDisplay.innerHTML)
                                    isPassThroughEnabled=true;
                                 }
                                 if(rotated===3){
                                    enableFreeze(playerDisplay.innerHTML)
                                    freezeEnabled=true;
                                 }
                                  moveBullet
                              }
                              else if(angle===270 && (speedy===1|| speedx===-1))
                              {
                                  temp=speedy
                                  speedy=speedx
                                  speedx=temp
                                  rotated++
                                  if(rotated===2){
                                    enablePassThrough(playerDisplay.innerHTML)
                                    isPassThroughEnabled=true;
                                 }
                                 if(rotated===3){
                                    enableFreeze(playerDisplay.innerHTML)
                                    freezeEnabled=true;
                                 }
                                  moveBullet
                              }
                              else{
                                fullGame.push(gameBoard.innerHTML)
                                nextPosition.innerHTML=""
                                if(nextPosition.dataset.player !==playerDisplay.innerHTML){
                                    enableSkip(playerDisplay.innerHTML)
                                    skipEnabled=true
                                }
                                nextPosition.dataset.player=""
                                clearInterval(moveBullet)
                                playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                                b.id=null
                                b.style.top=`${startTop}`
                                b.style.left=`${startLeft}`
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
                              rotated++
                              if(rotated===2){
                                enablePassThrough(playerDisplay.innerHTML)
                                isPassThroughEnabled=true;
                             }
                             if(rotated===3){
                                enableFreeze(playerDisplay.innerHTML)
                                freezeEnabled=true;
                             }
                              moveBullet
                          }
                      else if(angle===90 && (speedy===-1|| speedx===1))
                          {
                              temp=speedy
                              speedy=speedx
                              speedx=temp
                              rotated++
                              if(rotated===2){
                                enablePassThrough(playerDisplay.innerHTML)
                                isPassThroughEnabled=true;
                             }
                             if(rotated===3){
                                enableFreeze(playerDisplay.innerHTML)
                                freezeEnabled=true;
                             }
                              moveBullet
                          }
                          else if(angle===180 && (speedy===-1|| speedx===-1))
                          {
                              temp=speedy
                              speedy=-speedx
                              speedx=-temp
                              rotated++
                              if(rotated===2){
                                enablePassThrough(playerDisplay.innerHTML)
                                isPassThroughEnabled=true;
                             }
                             if(rotated===3){
                                enableFreeze(playerDisplay.innerHTML)
                                freezeEnabled=true;
                             }
                              moveBullet
                          }
                          else if(angle===270 && (speedy===1|| speedx===-1))
                          {
                              temp=speedy
                              speedy=speedx
                              speedx=temp
                              rotated++
                              if(rotated===2){
                                enablePassThrough(playerDisplay.innerHTML)
                                isPassThroughEnabled=true;
                             }
                             if(rotated===3){
                                enableFreeze(playerDisplay.innerHTML)
                                freezeEnabled=true;
                             }
                              moveBullet
                          }
                          else{
                            fullGame.push(gameBoard.innerHTML)
                              nextPosition.innerHTML=""
                              if(nextPosition.dataset.player !==playerDisplay.innerHTML){
                                enableSkip(playerDisplay.innerHTML)
                                skipEnabled=true
                            }
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
                              clearInterval(moveBullet)
                              playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                              b.id=null
                              b.style.top=`${startTop}`
                              b.style.left=`${startLeft}`
                              fullGame.push(gameBoard.innerHTML)
                              storeState()
                              isShooting=false
                              isClickable=true
                              startTimer()  
                          }
                      
                  }

              }
              else if(nextPosition &&  nextPosition.firstChild.id==="ricochet"){
                if (speedy === 1 || speedy === -1) {
                    b.style.top = `${(nextPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(currentPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                } else {
                    b.style.top = `${(currentPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(nextPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
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
                    rotated++
                    if(rotated===2){
                        enablePassThrough(playerDisplay.innerHTML)
                        isPassThroughEnabled=true;
                     }
                     if(rotated===3){
                        enableFreeze(playerDisplay.innerHTML)
                        freezeEnabled=true;
                     }
                    moveBullet
                }
            
            else if (nextPosition && nextPosition.firstChild.id === "titan") {
                if (speedy === 1 || speedy === -1) {
                    b.style.top = `${(nextPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(currentPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                } else {
                    b.style.top = `${(currentPosition.offsetTop + (nextPosition.offsetHeight-10)/2) / gameBoardHeight * 100}%`;
                    b.style.left = `${(nextPosition.offsetLeft + (nextPosition.offsetWidth-10)/2) / gameBoardWidth * 100}%`;
                }
                setTimeout(()=>{
                    fullGame.push(gameBoard.innerHTML)
                    b.id=null
                    stopTimer()
                    clearInterval(moveBullet);
                    storeState()
                    gameOver = true;
                    isClickable = false;
                    let lost = nextPosition.dataset.player;
                    won = (lost === "A") ? "B" : "A";
                    console.log(won, lost);
                    saveGameState()
                    winSound.play()
                    displayWinner(won);
                },50)
               
            }
            else
               { 
                if(canPassThrough){
                    disablePassThrough(playerDisplay.innerHTML)
                }
                clearInterval(moveBullet)
                playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
                b.id=null
                b.style.top=`${startTop}`
                b.style.left=`${startLeft}`
                storeState()
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
    const replay=document.createElement("button")
    replay.classList.add("restart")
    replay.innerHTML="REPLAY"
    replay.addEventListener("click",replayMoves)
    win.id = 'winner-message'
    win.innerHTML = `<h1>${winner} WON THE GAME</h1>`;
    document.body.appendChild(win)
    win.appendChild(restart)
    win.appendChild(replay)
}

          

