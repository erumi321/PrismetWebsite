function CreatePrivateGame()
{
    let date = new Date();
    let newGame = {
        timeCreated: date.getTime(),
        player1Joined: false,
        player2Joined: false,
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
    db.collection("games").add(newGame)
    .then((doc)=>{
        console.log(doc.id);
        window.location.href="/game.html#" + doc.id + "~1";
    });
}