var gameID = "";
var playerNum = -1;

var gameStarted = false;

function GetGameID()
{
    gameID = window.location.hash.split("~")[0].slice(1);
    playerNum = window.location.hash.split("~")[1];

    newPlayerLink =  window.location.href.split("~")[0] + "~2";

    document.getElementById("Title").innerHTML = "You are player: " + playerNum + "<br>Send this link to your friend: <a href='" + newPlayerLink + "'>" + newPlayerLink + "</a>";

    let playerField = "player" + playerNum + "Joined";

    db.collection("games").doc(gameID).update({
        [playerField]: true
    });

    db.collection("games").doc(gameID)
    .onSnapshot((doc) => {
        onSnapshot(doc);
    });

    db.collection("games").doc(gameID)
    .get().then((doc) => {
        onSnapshot(doc);
    });
}

function onSnapshot(doc) {
    console.log("Current data: ", doc.data());

    checkGameRematch(doc);
    if(!gameStarted){
        checkGameStart(doc);
    }else{
        checkGameBehaviour(doc);
    }
}

function checkGameBehaviour(doc){
    let p1Dice = doc.data().p1Dice;
    let p2Dice = doc.data().p2Dice;

    if (p1Dice.Dragons[2] != undefined && p2Dice.Dragons[2] != undefined){
        let points = [0, 0];
        
        populateOpponentDice(playerNum == 1? p2Dice: p1Dice);

        populatePlayerDice(playerNum == 1? p1Dice: p2Dice);
       
        document.getElementById("clientside--container").classList.add("leftAdjust");

        for(var i = 0; i < 3; i++){
            let p1DragonValue = p1Dice.Dragons[i];
            let p1BuffValue = p1Dice.Buffs[i];
            
            let p2DragonValue = p2Dice.Dragons[i];
            let p2BuffValue = p2Dice.Buffs[i];

            let p1Multiplier = (p1BuffValue % 2 != p1DragonValue % 2)? 1: gameConfig.SimilarityMultiplier; 
            let p2Multiplier = (p2BuffValue % 2 != p2DragonValue % 2)? 1: gameConfig.SimilarityMultiplier; 
            
            let p1Score = p1DragonValue + (p1BuffValue * p1Multiplier);
            let p2Score = p2DragonValue + (p2BuffValue * p2Multiplier);

            console.log(p1Score, p2Score);

            if (p1Score > p2Score){
                console.log("1");
                points[0] ++;
            }else if(p1Score < p2Score){
                console.log("2");
                points[1] ++;
            }else if (p1Score == p2Score){
                console.log("3");
                points[0] += 0.5;
                points[1] += 0.5;
            }
        }
    console.log(points);
        if (points[0] > points[1]){
            document.getElementById("victory--title").innerText = "PLAYER 1 WINS"

        }else if(points[0] < points[1]){
            document.getElementById("victory--title").innerText = "PLAYER 2 WINS"

        }else if (points[0] == points[1]){
            document.getElementById("victory--title").innerText = "TIE"
        }
        document.getElementById("victory--container").classList.remove("hidden");
    }
}

function populateOpponentDice(dice)
{
    let parentContainer = document.getElementById("opponentside--container");

    parentContainer.classList.remove("leftAdjust");
    parentContainer.classList.remove("hidden");
    requestAnimationFrame(() => { // wait just before the next paint
        parentContainer.classList.add("rightAdjust");
      });
    parentContainer.style = "opacity: 100%";

    RollDice(undefined, "opp--");

    for(var i = 0; i < 3; i++)
    {
        let buffContainer = document.getElementById("opp--buff--container");
        let dragonContainer =  document.getElementById("opp--dragon--container");
    
        console.log()

        for(var i = 0; i < 3; i++){
            let buffValue = dice.Buffs[i];
            let dragonValue = dice.Dragons[i];
           
    
            buffContainer.children[i].children[0].innerText = buffValue;
            buffContainer.children[i].children[0].setAttribute("draggable", "false");
            dragonContainer.children[i].children[0].innerText = dragonValue;
            dragonContainer.children[i].children[0].setAttribute("draggable", "false");
        }
    }
}

function populatePlayerDice(dice)
{
    let parentContainer = document.getElementById("clientside--container");

    requestAnimationFrame(() => { // wait just before the next paint
        parentContainer.classList.add("leftAdjust");
      });
    parentContainer.style = "opacity: 100%";

    RollDice(document.getElementById("rolldice--button"));
    document.getElementById("confirm--dice--btn").remove();

    for(var i = 0; i < 3; i++)
    {
        let buffContainer = document.getElementById("buff--container");
        let dragonContainer =  document.getElementById("dragon--container");
    
        //console.log()

        for(var i = 0; i < 3; i++){
            let buffValue = dice.Buffs[i];
            let dragonValue = dice.Dragons[i];
           
    
            buffContainer.children[i].children[0].innerText = buffValue;
            buffContainer.children[i].children[0].setAttribute("draggable", "false");
            dragonContainer.children[i].children[0].innerText = dragonValue;
            dragonContainer.children[i].children[0].setAttribute("draggable", "false");
        }
    }
}

function checkGameStart(doc){
    if(doc.data().player1Joined && doc.data().player2Joined){
        gameStarted = true;
        StartGame();
    }
}

function StartGame(){
    document.getElementById("waiting--container").classList.add("hidden");
    document.getElementById("game--container").classList.remove("hidden");
}

function checkGameRematch(doc){
    if(doc.data().player1Rematch && doc.data().player2Rematch){
        RestartGame();
    }
}

function RestartGame(){
    let date = new Date();
    let newGame = {
        timeCreated: date.getTime(),
        player1Joined: true,
        player2Joined: true,
        player1Rematch: false,
        player2Rematch: false,
        p1Dice: {
            Dragons: [

            ],
            Buffs: [

            ]
        },
        p2Dice: {
            Dragons: [

            ],
            Buffs: [

            ]
        },
        Points: [

        ]
    };
    db.collection("games").doc(gameID).set(newGame)
    .then(() =>{
        location.reload();

    });

}

function StartOverGame(){
    let playerField = "player" + playerNum + "Rematch";
    db.collection("games").doc(gameID).update({
        [playerField]: true
    });
}

var currentDraggingType = "";
var previousDropZone;

function RollDice(btn, prefix){

    btn != undefined? btn.setAttribute("style", "visibility: hidden;"): "";
    
    document.getElementById("confirm--dice--btn").classList.remove("hidden");

    for(var i = 0; i < 3; i++)
    {
        let containerName = (prefix || "") + "dragon--container";
        var e = document.querySelector("#" + containerName).children[i];
        
        //e.firstElementChild can be used.
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }
        
        let randInt = getRandomInt(gameConfig.DragonMinAmount, gameConfig.DragonMaxAmount)

        let newDice = document.createElement("div");
        


        document.getElementById(containerName).children[i].appendChild(newDice);

        newDice.setAttribute("id", "DragonDie" + i);
        newDice.setAttribute("draggable", "true");
        newDice.setAttribute("dragOnto", "Dragon");
        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;

        newDice.appendChild(newText);

        newDice.addEventListener("dragstart", e => {
            previousDropZone = newDice.parentNode;
            currentDraggingType = "Dragon";
            e.dataTransfer.setData("text/plain",  newDice.id);
        });
    }

    for(var i = 0; i < 3; i++)
    {
        let randInt = getRandomInt(gameConfig.BuffMinAmount, gameConfig.BuffMaxAmount)

        let newDice = document.createElement("div");
        
        let containerName = (prefix || "") + "buff--container";
        var e = document.querySelector("#" + containerName).children[i];
        
        //e.firstElementChild can be used.
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }

        document.getElementById(containerName).children[i].appendChild(newDice);

        newDice.setAttribute("id", "BuffDie" + i);
        newDice.setAttribute("draggable", "true");
        newDice.setAttribute("dragOnto", "Buff");
        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;

        newDice.appendChild(newText);

        newDice.addEventListener("dragstart", e => {
            previousDropZone = newDice.parentNode;
            currentDraggingType = "Buff";
            e.dataTransfer.setData("text/plain",  newDice.id);
        });
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ConfirmDice(btn)
{
    btn.setAttribute("style", "visibility: hidden;");

    let dieValues = {
        Dragons: [

        ],
        Buffs: [

        ]
    };

    let buffContainer = document.getElementById("buff--container");
    let dragonContainer = document.getElementById("dragon--container");

    for(var i = 0; i < 3; i++){
        let buffValue = buffContainer.children[i].children[0].innerText;
        let dragonValue = dragonContainer.children[i].children[0].innerText;

        let multiplier = (buffValue % 2 != dragonValue % 2)? 1: gameConfig.SimilarityMultiplier; 

        dieValues.Dragons[i] = parseInt(dragonValue);
        dieValues.Buffs[i] = parseInt(buffValue);
    }

    let playerDieField = "p" + playerNum + "Dice";

    db.collection("games").doc(gameID).update({
        [playerDieField]: dieValues
    });
}

for (const dropZone of document.querySelectorAll(".drop-zone")){
    dropZone.addEventListener("dragover", e => {
        e.preventDefault();

        if(currentDraggingType == dropZone.getAttribute("dragValue")){
            dropZone.classList.add("drop-zone--over");
        }

    })

    dropZone.addEventListener("dragleave", e => {
        dropZone.classList.remove("drop-zone--over");
    })

    dropZone.addEventListener("drop", e => {
        e.preventDefault();

        const droppedElementId = e.dataTransfer.getData("text/plain");
        const droppedElement = document.getElementById(droppedElementId);

        if(droppedElement.getAttribute("dragOnto") == dropZone.getAttribute("dragValue")){

            if(dropZone.children.length > 0){
                previousDropZone.appendChild(dropZone.children[0]);
                //dropZone.children[0].delete();
            }

            dropZone.appendChild(droppedElement);

            dropZone.classList.remove("drop-zone--over");
        }

    })
}