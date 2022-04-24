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
        console.log("Current data: ", doc.data());

        if(!gameStarted){
            checkGameStart(doc);
        }else{
            //checkGameBehaviour(doc);
        }
    });
}

function checkGameStart(doc){
    if(doc.data().player1Joined && doc.data().player2Joined){
        gameStarted = true;
        StartGame();
    }
}

function StartGame(){
    document.getElementById("waiting--container").classList.add("hidden")
    document.getElementById("game--container").classList.remove("hidden")
}