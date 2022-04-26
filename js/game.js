var gameID = "";
var playerNum = -1;

var gameStarted = false;

function GetGameID()
{
    gameID = window.location.hash.split("~")[0].slice(1);
    playerNum = window.location.hash.split("~")[1];

    newPlayerLink =  window.location.href.split("~")[0] + "~2";

    document.getElementById("Title").innerHTML = "You are player: " + playerNum + "<br>Send this link to your friend: <a href='" + newPlayerLink + "'>" + newPlayerLink + "</a>";



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
   
    let playerField = "player" + playerNum + "State";

    if (doc.data()[playerField] == 0){

        db.collection("games").doc(gameID).update({
            [playerField]: 1
        });
    }

    checkGameRematch(doc);
    if(!gameStarted){
        checkGameStart(doc);
    }else{
        checkGameBehaviour(doc);
    }
}

function calculateDragonScore(dragon){
    let dragonValue = dragon.Value;
    let buffValue = 0;
    
    for (var x = 1; x <= 3; x++){
        let buff = dragon["Buff" + x];
        if (buff == -1){
            continue; 
        }
        let multiplier = (buff % 2 != dragonValue % 2)? 1: gameConfig.SimilarityMultiplier; 
        buffValue += buff * multiplier;
    }
    
    let score = dragonValue + buffValue;

    return score
}

function checkGameBehaviour(doc){
    let p1Dice = doc.data().p1Dice;
    let p2Dice = doc.data().p2Dice;

    let playerStateField = "player" + playerNum + "State";
    if (doc.data()[playerStateField] == 2){
        populatePlayerDice(playerNum == 1? p1Dice: p2Dice);
    }

    let oppStateField = "player" + (playerNum == 1? 2: 1) + "State";
    if (doc.data()[oppStateField] == 2 && doc.data()[playerStateField] == 2){
        populateOpponentDice(playerNum == 1? p2Dice: p1Dice);
    }

    if (doc.data().player1State == 2 && doc.data().player2State == 2){
        let points = [0, 0];
        


        for(var i = 0; i < 3; i++){
            let p1Score = calculateDragonScore(p1Dice.Dragons[i]);
            let p2Score = calculateDragonScore(p2Dice.Dragons[i]);

            if (p1Score > p2Score){
                points[0] ++;
            }else if (p1Score < p2Score){
                points[1] ++;
            }else{
                points[0] += 0.5;
                points[1] += 0.5;
            }
        }
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

    parentContainer.style = "opacity: 100%";

    let createDice = function(parent, text, type)
    {
        let newDice = document.createElement("div");
        
        parent.appendChild(newDice);
        
        newDice.setAttribute("id", type + "Die" + i);

        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = text;

        newDice.appendChild(newText);

        if (type == "Buff"){
            UpdateDragonBuffs(newDice, parent, i + 1, "opp--")
        }
    }

    for(var i = 0; i < 3; i++)
    {
        if(dice.Dragons[i].Value == -1){
            continue;
        }
        let dragonContainer =  document.getElementById("opp--Dragonzone--" + (i + 1));
        
        var child = dragonContainer.lastElementChild; 
        while (child) {
            dragonContainer.removeChild(child);
            child = dragonContainer.lastElementChild;
        }

        createDice(dragonContainer, dice.Dragons[i].Value, "Dragon");


        for (var x = 1; x <= 3; x++){
            let buff =  dice.Dragons[i]["Buff" + x];
            if (buff == -1){
                continue; 
            }
            let buffContainer = document.getElementById("opp--Buffzone--" + (i + 1) + "--" + x);
            if(buffContainer.children.length > 0){
                var child = buffContainer.lastElementChild; 
                while (child) {
                    buffContainer.removeChild(child);
                    child = buffContainer.lastElementChild;
                }
            }

            createDice(buffContainer, buff, "Buff");
        }

    }
}

function populatePlayerDice(dice)
{
    let parentContainer = document.getElementById("clientside--container");

    document.getElementById("rolldice--button").remove();

    document.getElementById("confirm--dice--btn").remove();

    let createDice = function(parent, text, type, draggable)
    {
        let newDice = document.createElement("div");
        
        parent.appendChild(newDice);
        
        newDice.setAttribute("id", type + "Die" + i);

        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = text;

        newDice.appendChild(newText);

        if(draggable == true){
            newDice.setAttribute("draggable", "true");

            newDice.addEventListener("dragstart", event => {
                previousDropZone = newDice.parentNode;
                event.dataTransfer.setData("text/plain",  newDice.id);
            });
        }

        if (type == "Buff"){
            UpdateDragonBuffs(newDice, parent, i + 1)
        }
    }

    for(var i = 0; i < 3; i++)
    {
        if(dice.Dragons[i].Value == -1){
            continue;
        }
        let dragonContainer =  document.getElementById("Dragonzone--" + (i + 1));
        
        var child = dragonContainer.lastElementChild; 
        while (child) {
            dragonContainer.removeChild(child);
            child = dragonContainer.lastElementChild;
        }

        createDice(dragonContainer, dice.Dragons[i].Value, "Dragon", false);

        for (var x = 1; x <= 3; x++){
            let buff =  dice.Dragons[i]["Buff" + x];

            if (buff == -1){
                continue; 
            }
            let buffContainer = document.getElementById("Buffzone--" + (i + 1) + "--" + x);
            if(buffContainer.children.length > 0){
                var child = buffContainer.lastElementChild; 
                while (child) {
                    buffContainer.removeChild(child);
                    child = buffContainer.lastElementChild;
                }
            }

            createDice(buffContainer, buff, "Buff", true);

            if (x == 3){
            }
        }
    }
}

function checkGameStart(doc){
    if(doc.data().player1State >= 1 && doc.data().player2State >= 1){
        gameStarted = true;
        StartGame();
        checkGameBehaviour(doc);
    }
}

function StartGame(){
    document.getElementById("waiting--container").classList.add("hidden");
    document.getElementById("game--container").classList.remove("hidden");
}

function checkGameRematch(doc){
    if(doc.data().player1State == 3 && doc.data().player2State == 3){
        RestartGame();
    }
}

function RestartGame(){
    let date = new Date();
    let newGame = {
        timeCreated: date.getTime(),
        player1State: 0, //0 = not joined, 1 = joined, 2 = ready, 3 = rematch
        player2State: 0, //0 = not joined, 1 = joined, 2 = ready, 3 = rematch
        p1Dice: {
            Dragons: [
                {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 },
                {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 },
                 {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 }
            ],
        },
        p2Dice: {
            Dragons: [
                {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 },
                {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 },
                 {
                    Value: -1,
                    Buff1: -1,
                    Buff2: -1,
                    Buff3: -1,
                 }
            ],
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
    let playerField = "player" + playerNum + "State";
    db.collection("games").doc(gameID).update({
        [playerField]: 3
    });
}

var previousDropZone;

function RollDice(btn){

    btn != undefined? btn.setAttribute("style", "visibility: hidden;"): "";
    
    document.getElementById("confirm--dice--btn").classList.remove("hidden");

    for(var i = 0; i < 3; i++)
    {
        let containerName = "Dragonzone--" + (i + 1);
        var e = document.querySelector("#" + containerName);

        //e.firstElementChild can be used.
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }
        
        let randInt = getRandomInt(gameConfig.DragonMinAmount, gameConfig.DragonMaxAmount)

        let newDice = document.createElement("div");
        
        e.appendChild(newDice);

        newDice.setAttribute("id", "DragonDie" + i);

        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;

        newDice.appendChild(newText);
    }

    for(var i = 0; i < 3; i++)
    {
        let randInt = getRandomInt(gameConfig.BuffMinAmount, gameConfig.BuffMaxAmount)

        let newDice = document.createElement("div");
        
        let containerName = "Buffzone--" + (i + 1) + "--1";
        var e = document.querySelector("#" + containerName);
        
        //e.firstElementChild can be used.
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }

        e.appendChild(newDice);

        newDice.setAttribute("id", "BuffDie" + i);
        newDice.setAttribute("draggable", "true");
        newDice.setAttribute("dragOnto", "Buff");
        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;

        newDice.appendChild(newText);
        
        UpdateDragonBuffs(newDice, e, i+1);

        newDice.addEventListener("dragstart", event => {
            previousDropZone = newDice.parentNode;
            event.dataTransfer.setData("text/plain",  newDice.id);

        });
    }
}

function UpdateDragonBuffs(droppedElement, dropZone, index, prefix){
    
    let dropVal = parseInt(droppedElement.children[0].innerText);
    let dragonVal = parseInt(document.getElementById((prefix || "") + "Dragonzone--" + index).children[0].innerText);

    console.log(dropVal, dropVal % 2)
    console.log(dragonVal, dragonVal % 2)

    if ( dropVal % 2 == dragonVal % 2){
        dropZone.style.borderColor = "#297336";
    }else{
        dropZone.style.borderColor = "#31cfde";
    }


    let tempDragon = {
        Value: -1,
        Buff1: -1,
        Buff2: -1,
        Buff3: -1
    }

    console.log(index);

    tempDragon.Value = dragonVal;

    for(var x = 1; x <= 3; x++){
        let buffZone = document.getElementById((prefix || "") + "Buffzone--" + index + "--" + x);

        if (buffZone.children.length > 0){
            tempDragon["Buff" + x] = parseInt(buffZone.children[0].innerText);
        }
    }

    let textElement = document.getElementById((prefix || "") + "Dragonvalue--" + index);
    textElement.innerText = calculateDragonScore(tempDragon);
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
            {
                Value: -1,
                Buff1: -1,
                Buff2: -1,
                Buff3: -1,
             },
            {
                Value: -1,
                Buff1: -1,
                Buff2: -1,
                Buff3: -1,
             },
             {
                Value: -1,
                Buff1: -1,
                Buff2: -1,
                Buff3: -1,
             }
        ],
    };

    for(var i = 1; i <= 3; i++){
        let dragonZone = document.getElementById("Dragonzone--" + i);

        dieValues.Dragons[i - 1].Value = parseInt(dragonZone.children[0].innerText);

        for (var x = 1; x <= 3; x++){
            let buffZone = document.getElementById("Buffzone--" + i + "--" + x);

            if(buffZone.children.length > 0){
                dieValues.Dragons[i - 1]["Buff" + x] = (parseInt(buffZone.children[0].innerText))
            }
        }
    }

    let playerDieField = "p" + playerNum + "Dice";
    let playerStateField = "player" + playerNum + "State";

    db.collection("games").doc(gameID).update({
        [playerDieField]: dieValues,
        [playerStateField]: 2
    });
}

for (const dropZone of document.querySelectorAll(".drop-zone")){
    dropZone.addEventListener("dragover", e => {
        e.preventDefault();
        dropZone.classList.add("drop-zone--over");

    })

    dropZone.addEventListener("dragleave", e => {
        dropZone.classList.remove("drop-zone--over");
    })

    dropZone.addEventListener("drop", e => {
        e.preventDefault();

        const droppedElementId = e.dataTransfer.getData("text/plain");
        const droppedElement = document.getElementById(droppedElementId);

       
        if(dropZone.children.length > 0){
            previousDropZone.appendChild(dropZone.children[0]);
            //dropZone.children[0].delete();
        }

        previousDropZone.style.borderColor = "#31cfde";

        dropZone.appendChild(droppedElement);

        dropZone.classList.remove("drop-zone--over");

        let index = dropZone.getAttribute("dragIndex");

        UpdateDragonBuffs(droppedElement, dropZone, index);
        

    })
}