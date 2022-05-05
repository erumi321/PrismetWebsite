var gameID = "";
var playerNum = -1;

var gameStarted = false;
var currentPlayerState = 100;

function copyLink(){
    /* Get the text field */
    var copyText = document.getElementById("invite--link");

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.innerText);


    document.getElementById("waiting--copy--icon").classList.add("hidden");
    document.getElementById("waiting--checkmark--icon").classList.remove("hidden");

    let copyBtn = document.getElementById("invite--copy--btn");
    copyBtn.setAttribute("style", "cursor: deafult");
    copyBtn.setAttribute("onclick", "");

    setTimeout(()=>{
        document.getElementById("waiting--copy--icon").classList.remove("hidden");
        document.getElementById("waiting--checkmark--icon").classList.add("hidden");
        copyBtn.setAttribute("style", "cursor: pointer");

        copyBtn.setAttribute("onclick", "copyLink()");
    }, 2000)
}

function ReturnToHome() {
    // delete game

    location.href = "index.html";
}

function GetGameID()
{
    document.documentElement.style.setProperty('--wing-color', gameConfig.WingColor);
    document.documentElement.style.setProperty('--tail-color', gameConfig.TailColor);
    document.documentElement.style.setProperty('--body-color', gameConfig.BodyColor);
    document.documentElement.style.setProperty('--similar-color', gameConfig.SimilarColor);

    gameID = window.location.hash.split("~")[0].slice(1);
    playerNum = window.location.hash.split("~")[1];

    newPlayerLink =  window.location.href.split("~")[0] + "~2";

    document.getElementById("invite--link").innerHTML = newPlayerLink.substring();

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
    var currentPlayerState = doc.data()[playerField];

    if (doc.data()[playerField] == 0){

        db.collection("games").doc(gameID).update({
            [playerField]: 1
        });
        currentPlayerState = 1;
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
    currentPlayerState = doc.data()[playerStateField];
    if (doc.data()[playerStateField] >= 1.5){
        populatePlayerDice(playerNum == 1? p1Dice: p2Dice, doc.data()[playerStateField] >= 2? true:false);
    }

    let oppStateField = "player" + (playerNum == 1? 2: 1) + "State";
    if (doc.data()[oppStateField] >= 2 && doc.data()[playerStateField] >= 2){
        populateOpponentDice(playerNum == 1? p2Dice: p1Dice);
    }

    if (doc.data().player1State >= 2 && doc.data().player2State >= 2){
        let p1Values = [];
        let p2Values = [];

        for(var i = 0; i < 3; i++){
            p1Values.push(calculateDragonScore(p1Dice.Dragons[i]));
            p2Values.push(calculateDragonScore(p2Dice.Dragons[i]));
        }

        p1Values.sort(function(a, b) {
            return b - a;
          });
        p2Values.sort(function(a, b) {
            return b - a;
          });

        let newP1Dice = {
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
        let newP2Dice = {
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
        
        for(var i = 0; i < 3; i++){
            let p1Value = calculateDragonScore(p1Dice.Dragons[i]);
            let newIndex = p1Values.indexOf(p1Value);
            newP1Dice.Dragons[newIndex] = p1Dice.Dragons[i];

            let p2Value = calculateDragonScore(p2Dice.Dragons[i]);
            newIndex = p2Values.indexOf(p2Value);
            newP2Dice.Dragons[newIndex] = p2Dice.Dragons[i];
        }

        populatePlayerDice(playerNum == 1? newP1Dice: newP2Dice, doc.data()[playerStateField] >= 2? true:false);

        populateOpponentDice(playerNum == 1? newP2Dice: newP1Dice);

        let points = [0, 0];
        
        for(var i = 0; i < 3; i++){
            let p1Score = calculateDragonScore(newP1Dice.Dragons[i]);
            let p2Score = calculateDragonScore(newP2Dice.Dragons[i]);

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
            document.getElementById("victory--title").innerText = "YOU " + (playerNum == 1? "WIN" : "LOSE")

        }else if(points[0] < points[1]){
            document.getElementById("victory--title").innerText = "YOU " + (playerNum == 2? "WIN" : "LOSE")

        }else if (points[0] == points[1]){
            document.getElementById("victory--title").innerText = "YOU TIE"
        }



    }

    if (doc.data()[playerStateField] == 3) {
        StartOverGame(document.getElementById("go--again"), false);
    }
}

function populateOpponentDice(dice)
{
    let parentContainer = document.getElementById("opponentside--container");
    let victoryContainer = document.getElementById("victory--container");

    parentContainer.classList.remove("hidden");
    victoryContainer.classList.remove("hidden");
    parentContainer.style.top = "-30vh";
    if (victoryContainer.getAttribute("doFade") == "true"){
        victoryContainer.style.opacity = "0%";
    }
    
    requestAnimationFrame(() => { // wait just before the next paint
        if (victoryContainer.getAttribute("doFade") == "true"){
            victoryContainer.setAttribute("doFade", "false")
            setTimeout(() => {
                victoryContainer.style.opacity = "";
            }, 1000);
        }

        parentContainer.style.top = "";
    });

    let createDice = function(parent, text, type)
    {
        let newDice = document.createElement("div");
        
        parent.appendChild(newDice);
        
        newDice.setAttribute("id", type + "Die" + i);


        let newText = document.createElement("p");
        newText.innerText = text;

        newDice.appendChild(newText);

        if (type == "Buff"){
            newDice.classList.add("draggableDie");
            UpdateDragonBuffs(i + 1, "opp--")
        }else{
            newDice.classList.add("dragonDie");
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
        UpdateDragonBuffs(i + 1, "opp--", true)

    }
}

function populatePlayerDice(dice, doConfirmDelete)
{
    let parentContainer = document.getElementById("clientside--container");

    if (document.contains(document.getElementById("rolldice--button"))) {
        document.getElementById("rolldice--button").remove();
    } 
    if (document.contains(document.getElementById("confirm--dice--btn"))) {
        if (doConfirmDelete){
            document.getElementById("confirm--dice--btn").remove();
        }else{
            document.getElementById("confirm--dice--btn").classList.remove("confirm--dice--btn--hidden");
        }
    }

    let createDice = function(parent, text, type, draggable)
    {
        let newDice = document.createElement("div");
        
        parent.appendChild(newDice);
        
        newDice.setAttribute("id", type + "Die" + i);


        let newText = document.createElement("p");
        newText.innerText = text;

        newDice.appendChild(newText);

        if(draggable == true){
            newDice.classList.add("draggableDie");
            newDice.setAttribute("draggable", currentPlayerState <= 1.5? "true": "false");

            newDice.addEventListener("dragstart", event => {
                newDice.setAttribute("previousparentid", newDice.parentNode.id);
                event.dataTransfer.setData("text/plain",  newDice.id);
                
            });
        }else{
            newDice.classList.add("dragonDie");
        }

        if (type == "Buff"){
            UpdateDragonBuffs(i + 1)
        }
    }

    for(var i = 0; i < 3; i++)
    {
        let dragonContainer =  document.getElementById("Dragonzone--" + (i + 1));
        var child = dragonContainer.lastElementChild; 
        while (child) {
            dragonContainer.removeChild(child);
            child = dragonContainer.lastElementChild;
        }

        if(dice.Dragons[i].Value == -1){
            continue;
        }

        createDice(dragonContainer, dice.Dragons[i].Value, "Dragon", false);

        for (var x = 1; x <= 3; x++){
            let buff =  dice.Dragons[i]["Buff" + x];

            let buffContainer = document.getElementById("Buffzone--" + (i + 1) + "--" + x);
            if(buffContainer.children.length > 0){
                var child = buffContainer.lastElementChild; 
                while (child) {
                    buffContainer.removeChild(child);
                    child = buffContainer.lastElementChild;
                }
            }

            if (buff == -1){
                continue; 
            }


            createDice(buffContainer, buff, "Buff", true);

        }
    UpdateDragonBuffs(i + 1, null, true)
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
        player1State: 1, //0 = not joined, 1 = joined, 2 = ready, 3 = rematch
        player2State: 1, //0 = not joined, 1 = joined, 2 = ready, 3 = rematch
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

function StartOverGame(btn, updateState){
    btn.querySelector("#victory--btnText").innerHTML = "Waiting";
     btn.classList.add("victory--button--active");

    if (updateState){
        let playerField = "player" + playerNum + "State";
        db.collection("games").doc(gameID).update({
            [playerField]: 3
        });
        currentPlayerState = 3;
    }
}


function RollDice(btn){

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
    }

    btn != undefined? btn.setAttribute("style", "visibility: hidden;"): "";
    
    document.getElementById("confirm--dice--btn").classList.remove("confirm--dice--btn--hidden");

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

        newDice.classList.add("dragonDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;

        dieValues.Dragons[i].Value = randInt

        newDice.appendChild(newText);
    }

    for(var x = 1; x <= 3; x++)
    {
        let randInt = getRandomInt(gameConfig.BuffMinAmount, gameConfig.BuffMaxAmount)

        let newDice = document.createElement("div");
        
        let containerName = "Buffzone--" + x + "--1";
        var e = document.querySelector("#" + containerName);
        
        //e.firstElementChild can be used.
        var child = e.lastElementChild; 
        while (child) {
            e.removeChild(child);
            child = e.lastElementChild;
        }

        e.appendChild(newDice);

        newDice.setAttribute("id", "BuffDie" + x);
        newDice.setAttribute("draggable", "true");
        newDice.setAttribute("dragOnto", "Buff");
        newDice.classList.add("draggableDie");

        let newText = document.createElement("p");
        newText.innerText = randInt;
        
        dieValues.Dragons[x - 1].Buff1 = randInt

        newDice.appendChild(newText);
        
        UpdateDragonBuffs(x);

        newDice.addEventListener("dragstart", event => {
            newDice.setAttribute("previousparentid", newDice.parentNode.id);
            event.dataTransfer.setData("text/plain",  newDice.id);
        });
    }

    let playerStateField = "player" + playerNum + "State";
    let playerDieField = "p" + playerNum + "Dice";
    currentPlayerState = 1.5;

    db.collection("games").doc(gameID).update({
        [playerDieField]: dieValues,
        [playerStateField]: 1.5
    });
}

function UpdateDragonBuffs(index, prefix, textOnly){
    let dragonVal = parseInt(document.getElementById((prefix || "") + "Dragonzone--" + index).children[0].innerText);

    let tempDragon = {
        Value: -1,
        Buff1: -1,
        Buff2: -1,
        Buff3: -1
    }

    tempDragon.Value = dragonVal;

    for(var x = 1; x <= 3; x++){
        let buffZone = document.getElementById((prefix || "") + "Buffzone--" + index + "--" + x);

        if(textOnly != true){
            if (buffZone.children.length > 0 && buffZone.children[0].innerText % 2 == dragonVal % 2){
                buffZone.classList.add("similar-color");
            }else{
                buffZone.classList.remove("similar-color");
            }
        }

        if (buffZone.children.length > 0){
            tempDragon["Buff" + x] = parseInt(buffZone.children[0].innerText);
        }
    }

    let textElement = document.getElementById((prefix || "") + "Dragonvalue--" + index);
    
    let text = calculateDragonScore(tempDragon);

    textElement.innerText = text;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ConfirmDice(btn)
{
    let dies = document.getElementsByClassName("draggableDie")
    for (var die of dies){
        die.setAttribute("draggable", false);
    }

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
    currentPlayerState = 2;

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

        let previousDropZone = document.getElementById(droppedElement.getAttribute("previousparentid"));
       
        if(dropZone.children.length > 0){
            previousDropZone.appendChild(dropZone.children[0]);
        }

        dropZone.appendChild(droppedElement);
        dropZone.classList.remove("drop-zone--over");
        
        UpdateDragonBuffs(previousDropZone.getAttribute("dragIndex"));

        let index = dropZone.getAttribute("dragIndex");

        UpdateDragonBuffs(index);
        

    })
}