const canvas = document.getElementById("screen")
const ctx = canvas.getContext("2d")

//start menu variable
const startMenu = document.getElementById("start-menu");
const startButton = document.getElementById("startButton");
const exitButton = document.getElementById("exitButton");

//Restart menu varibles
const restart = document.createElement("button")
const gameOverElement = document.createElement("p");
const scoreShowElement = document.createElement("p")


//Board Dimension
boardWidth = 1000
boardHeight = 600

//Canvas dimension
canvas.width = boardWidth
canvas.height = boardHeight

// Bug Dimension
let bugWidth = 50
let bugHeight = 50

// bugImage
let bugImage = new Image();
bugImage.src = "images/ladybug.png";

// Obstacle Dimension
const obstacleWidth = 50;
const obstacleHeight = 50;

// bugImage
let obstacleImage = new Image();
obstacleImage.src = "images/bird.png";

let obstacles_list = []
let obstacleSpeed = 5


const minDistance = 50; 

//wires
const wires =  [
    {x:canvas.width/5,y:canvas.height},
    {x:2*canvas.width/5,y:canvas.height},
    {x:3*canvas.width/5,y:canvas.height},
    {x:4*canvas.width/5,y:canvas.height}
]

//Index of bug
let bugIndex = 2

//bug position
const bug  = {x:wires[bugIndex].x - bugWidth * 0.5,
                y:canvas.height * 0.75 - bugHeight * 0.5}

//GameOver
let isGameOver =false

// Jump parameters
let isJumping = false
const jumpHeight = 100;
const jumpDuration = 500;
fallDuration = 300
const scaleAmount = 0.02;

//timerId
let timerID

//score
score = 0

//Sets the stroke syle
ctx.strokeStyle = "#000000"

//Sets the lineWidth.
ctx.lineWidth = 3;

//Set audio
const gameAudio = new Audio('./audio/intro-sound.mp3');
const gameOverAudio = new Audio('./audio/game-end.mp3');
const jumpSound = new Audio('./audio/jump-sound.mp3')

//draws the line
function draw_line(){  
    for(let i in wires){
        ctx.beginPath()
        ctx.moveTo(wires[i].x,0)
        ctx.lineTo(wires[i].x,canvas.height)  
        ctx.stroke()
    }
}

//draw the bug
function draw_bug(shouldDraw) {
    const rectX = wires[bugIndex].x - bugWidth * 0.5;
    const rectY =  canvas.height * 0.75 - bugHeight * 0.5;
    if (shouldDraw) {
        ctx.drawImage(
            bugImage,
            rectX,
            rectY,
            bugWidth,
            bugHeight
          );
    } else {
        ctx.clearRect(rectX, rectY, bugWidth, bugHeight);
    }

}

// creates new obstacles
function createNewObstacle() {
    let randomWireIndex = Math.floor(Math.random() * wires.length);
    let obstacleX = wires[randomWireIndex].x;
    let obstacleY = obstacleHeight;
    dy = obstacleSpeed

    return {x: obstacleX, y: obstacleY,dy:dy}
}

// function to draw obstacles
function drawObstacles() {
       if( Math.random() <0.028){
           const newObstacle  = createNewObstacle()
           if(obstacles_list.length>0){
               const prevObstacle = obstacles_list[obstacles_list.length - 1];
                if(newObstacle.y - prevObstacle.y < minDistance){
                    newObstacle.y += minDistance 
                }
            }
           obstacles_list.push(newObstacle) 
       }
       ctx.fillStyle = "red";
       for (let obstacle of obstacles_list) {
           ctx.drawImage(obstacleImage,
               obstacle.x - obstacleWidth / 2,
               obstacle.y - obstacleHeight / 2,
               obstacleWidth,
               obstacleHeight
               )
           }
   }

function updateObstacles() {
    for (let obstacle of obstacles_list) {
        obstacle.y += obstacle.dy; //speed of the obstacle coming

        // Handle collision when jumping and not jumping
        if (!isJumping) {
            bug.y += 5; // Adjust the fall speed as needed
            if (isCollision({ x: wires[bugIndex].x, y: canvas.height * 0.75 }, obstacle) ) {
                // Handle collision (e.g., end the game or reduce lives)
                isGameOver = true
                gameOver()
                change_bug_line(isGameOver)
            }
          }

        //boundary condition
        if (obstacle.y > boardHeight) {
            obstacles_list.splice(obstacles_list.indexOf(obstacle), 1);
            score++
            if (score % 50 === 0) {
                obstacleSpeed += 2;
            }
        }
    }
}

// Jump function
function jump() {
    if (!isJumping) {
      isJumping = true;
      const originalBugWidth = bugWidth
      const originalBugHeight = bugHeight;
      const startTime = performance.now();

      jumpSound.play()
  
      function jumpAnimation() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < jumpDuration) {
          // Jump animation
          const progress = elapsedTime / jumpDuration;
          bug.y = canvas.height * 0.75 - originalBugHeight * 0.5 - jumpHeight * Math.sin(progress * Math.PI);
  
          // Scale the bug during the jump
          const scale = 1 + scaleAmount * Math.sin(progress * Math.PI);
          bugWidth *= scale;
          bugHeight *= scale;
  
          requestAnimationFrame(jumpAnimation);
        } 
        else if (elapsedTime < jumpDuration + fallDuration) {
          // Fall animation
          const fallProgress = (elapsedTime - jumpDuration) / fallDuration;
          bug.y = canvas.height * 0.75 - originalBugHeight * 0.5 + jumpHeight * Math.sin(fallProgress * Math.PI);
  
          // Scale the bug during the fall (optional)
          const scale = 1 - scaleAmount * Math.sin(fallProgress * Math.PI);
          bugWidth *= scale;
          bugHeight *= scale;
  
          requestAnimationFrame(jumpAnimation);
        } 
        else {
          // Reset bug position and dimensions
          bug.y = canvas.height * 0.75 - originalBugHeight * 0.5;
          bugWidth = originalBugWidth;
          bugHeight = originalBugHeight;
  
          isJumping = false;
        }
      }
      jumpAnimation();
    }
  }

function isCollision(bug, obstacle) {
    // Check if the bug's rectangle intersects with the obstacle's rectangle
    return (
        bug.x < obstacle.x + obstacleWidth &&
        bug.x + bugWidth > obstacle.x &&
        bug.y < obstacle.y + obstacleHeight &&
        bug.y + bugHeight > obstacle.y
    )
}

//Change line of bug
function update_line(key){
    switch(key){
        case "ArrowLeft":
            draw_bug(false)
            bugIndex--
            if(bugIndex<0) bugIndex = 0
        break;

        case "ArrowRight":
            draw_bug(false)
            bugIndex++
            if(bugIndex>=wires.length) bugIndex = wires.length-1
        break;

        case "ArrowUp":
            jump()
        break;
    }
    draw_bug(true)
}

function change_bug_line(isGameOver){
    console.log(isGameOver)
    if(!isGameOver){
      window.document.addEventListener("keydown",onKeydown)
    }
}

//Handle key down event.
function onKeydown(e) {
    update_line(e.key);
}

function updateScore(){
    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Score:${score}`, 60, 50);

}

function gameOver(){
    gameAudio.pause();
    gameOverAudio.play();
    clearInterval(timerID)
    displayGameOverMessage(); 
    window.document.removeEventListener("keydown", onKeydown);
    // ctx.fillText(`Final Score: ${score}`, canvas.width / 2, (canvas.height / 2)+100);
}   

function displayGameOverMessage() {
    restartGame()
}


function restartGame(){    
    
        gameOverElement.innerText = "Game Over"
        gameOverElement.setAttribute("id", 'game-over')
        document.body.appendChild(gameOverElement)
        
        scoreShowElement.innerText = `Final score: ${score}`
        scoreShowElement.setAttribute("id", 'game-over')
        document.body.appendChild(scoreShowElement)
    
        restart.innerText = "Restart"
        restart.setAttribute("id", 'restart-game')
        document.body.appendChild(restart)

    
}


//Game loop
function gameLoop() {
    // Only continue the game loop if the game hasn't ended
           ctx.clearRect(0, 0, canvas.width, canvas.height);
           draw_line();
           draw_bug(true);  
           updateObstacles();
           drawObstacles();
           updateScore();
           
}

function startGame(){
    parent =  gameOverElement.parentNode
    isGameOver =false
    score = 0
    obstacleSpeed =5
    obstacles_list =[]

    if (gameOverElement) {
        gameOverElement.remove()
    }

    if (scoreShowElement) {
        scoreShowElement.remove()
    }

    if (restart){
        restart.remove()
    }
    

    //controls the keyboard event
    change_bug_line(isGameOver)
    
    //renders the screen 60 frames per second.
    timerID = setInterval(gameLoop,1000/60)

    //play when game starts 
    gameAudio.play();
}

window.onload = () =>{
    // Preload the audio for better performance
    gameAudio.preload = 'auto';
    gameAudio.load();

    gameOverAudio.preload = "auto";
    gameOverAudio.load()

    jumpSound.preload = "auto";
    jumpSound.load()

    // Attach an event listener to the audio to loop it
    gameAudio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });

    // Event listener for start button
    startButton.addEventListener("click", () => {
        startMenu.style.display = "none"; // Hide the start menu
        startGame(); // Call a function to start the game
      })
    
    
    
    // Event listener for exit button
    exitButton.addEventListener("click", () => {
        window.location.href = "about:blank"; // Change the URL to exit the game (you can customize this)
    })
    
    restart.addEventListener("click", () =>{
        startGame();
    })
}