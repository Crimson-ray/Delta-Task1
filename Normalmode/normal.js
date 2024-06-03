
const gameBoard=document.querySelector("#gameboard")
const playerDisplay=document.querySelector("#player")
const infoDisplay=document.querySelector("#info-display")
const width=8
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
        if (square.querySelector('.bullet')) {
            square.querySelector('.bullet').classList.add((i <= 4) ? "greenb" : "blackb");
        }
        col=col+1
    })
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
                gameOver = true;
                isClickable = false;
                won="B"
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
                won="A"
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
// Reset Button
function reset(){
    clearInterval(clock)
    clearInterval(moveBullet)
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
    selectedSquare = null;
    isClickable = true;
    isPaused = false
    angleA[0]=0
    angleA[1]=0
    angleB[0]=0
    angleB[1]=0
    clearPaths()
    document.querySelector("#player").innerHTML="A"
    document.querySelector("#gameboard").innerHTML=""
    createBoard()
    startTimer()
}

// pauseButton

function pause(){
        isPaused = !isPaused;
        if (!isPaused) {
            startTimer(); 
            document.querySelector('.pause').innerText = 'Pause'
            document.querySelector(".reset").disabled=false
        } else {
            clearPaths()
            stopTimer(); 
            document.querySelector('.pause').innerText = 'Resume'
            document.querySelector(".reset").disabled=true
        }
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
    if (target.classList.contains("piece") && target.parentElement.dataset.player === currentPlayer) {
        selectedSquare = target.parentElement;
        selectedSquare.classList.add("selected");
        showPaths(selectedSquare);
    }
});

// displaying
function showPaths(square) {
    let row = parseInt(square.getAttribute("square-row"));
    let col = parseInt(square.getAttribute("square-col"));
    let positions = [];
    const pieceId = square.querySelector(".piece").id;

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
    positions.forEach(position => {
        let [posRow, posCol] = position;
        let pathSquare = document.querySelector(`.square[square-row="${posRow}"][square-col="${posCol}"]`);
        if (pathSquare && !pathSquare.innerHTML) {
            pathSquare.classList.add("path");
            pathSquare.addEventListener("click", movePiece, { once: true });
        }
    });
}
function clearPaths() {
    document.querySelectorAll(".path").forEach(path => {
        path.classList.remove("path");
        path.replaceWith(path.cloneNode(true)); 
    });
}

function movePiece(event) {
    const targetSquare = event.currentTarget;
    if (selectedSquare && targetSquare.classList.contains("path")) {
        targetSquare.innerHTML = selectedSquare.innerHTML;
        selectedSquare.innerHTML = "";
        targetSquare.dataset.player = selectedSquare.dataset.player;
        delete selectedSquare.dataset.player;
        clearPaths();
        removeButtons();
        shoot()
        selectedSquare.classList.remove("selected");
        selectedSquare = null;
        playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
    }
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
    shoot();
    if (selectedSquare) {
        selectedSquare.classList.remove("selected");
        selectedSquare = null;
    }
    playerDisplay.innerText = playerDisplay.innerText === "A" ? "B" : "A";
    console.log(angleA, angleB);
}
function rotateRight(square){
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
     }
     Rotation()
}
function rotateLeft(square){
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
     }
     Rotation()
}

// shooting 
function shoot(){
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
    let canon=currentPosition
    console.log(canon)
    moveBullet=setInterval(shooter,300)
    function shooter(){
        if (isPaused) return;
        isClickable=false
        row=parseInt(currentPosition.getAttribute("square-row"))
        col=parseInt(currentPosition.getAttribute("square-col"))
        nextPosition=document.querySelector(`.square[square-row="${row+speedy}"][square-col="${col+speedx}"]`);
        console.log(currentPosition)
        console.log(nextPosition)
        console.log(speedx,speedy)
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
              if(nextPosition && (nextPosition.firstChild.id !=="semi" && nextPosition.firstChild.id !=="ricochet" && nextPosition.firstChild.id !=="titan")){
                     let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                     if (bulletInCurrentPosition) {
                     bulletInCurrentPosition.remove();
                     canon.appendChild(b)
                     console.log(canon)
                     clearInterval(moveBullet)
                     b.classList.remove("displayBullet")
                     isShooting=false
                     isClickable=true
                     startTimer()
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
                                        canon.appendChild(b)
                                        console.log(canon)
                                        clearInterval(moveBullet)
                                        b.classList.remove("displayBullet")
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
                                    canon.appendChild(b)
                                    console.log(canon)
                                    clearInterval(moveBullet)
                                    b.classList.remove("displayBullet")
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
                    clearInterval(moveBullet);
                    gameOver = true;
                    isClickable = false;
                    let lost = nextPosition.dataset.player;
                    let won = (lost === "A") ? "B" : "A";
                    console.log(won, lost);
                    displayWinner(won);
                }
                else
                   { 
                       let bulletInCurrentPosition = currentPosition.querySelector(".bullet");
                       if (bulletInCurrentPosition) {
                       bulletInCurrentPosition.remove();
                       canon.appendChild(b)
                       console.log(canon)
                       clearInterval(moveBullet)
                       b.classList.remove("displayBullet")
                       clearInterval(moveBullet)}
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
