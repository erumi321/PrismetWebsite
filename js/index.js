function CreatePrivateGame()
{
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
    db.collection("games").add(newGame)
    .then((doc)=>{
        console.log(doc.id);
        window.location.href="/game.html#" + doc.id + "~1";
    });
}