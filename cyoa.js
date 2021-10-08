let playerMoney = 0;
let playerChoicesUsed = [
];
let currentScene = {};
let currentChoice = 0;
let queuedSceneId = 0;

const UpdatePlayerState = () => {
    $('#displayMoney').text(`$${playerMoney}`);
}

const ModifyMoney = (amount, messageUpdate=false) => {
    if(messageUpdate) {
        alert(`You ${amount < 0 ? 'lost' : 'gained'} $${amount}!`);
    }
    playerMoney += amount;
    UpdatePlayerState();
}

const RunGameEvent = (eventQueued) => {

    const eventList = [
        'MODIFY_MONEY',
        'ADD_ITEM',
        'REMOVE_ITEM'
    ]

    const { type, value } = eventQueued;

    switch(type) {

        case('MODIFY_MONEY'):
            ModifyMoney(value)
            break

        default:
            break
    }

}

const gameScenes = [
    {
        _id: 0,
        label: "Prologue",
        displayText: "You awaken in the middle of a forest with no idea of how you got there.",
        choices: [
            {
                _id: 0,
                canRepeat: false,
                displayText: "Look around for clues.",
                condition: true,
                hideOnConditionFail: false,
                resultText: "You search the ground around you. Oh look, you found 40 bucks!",
                resultLink: -1, // -1 to stay on current area
                resultEvents: [
                    { type: 'MODIFY_MONEY', value: 40}
                ]
            },
            {
                _id: 1,
                canRepeat: false,
                displayText: "Start walking in a random direction.",
                condition: true,
                hideOnConditionFail: false,
                resultText: "You begin walking in the direction of the nearest town.",
                resultLink: 1
            }
        ]
    },
    {
        _id: 1,
        label: "On the Road to Town",
        displayText: "You begin walking on the road when something exciting happens.",
        choices: [
            {
                _id: 0,
                canRepeat: false,
                displayText: "Keep Walking",
                condition: true
            }
        ]
    }
]


const RenderScene = (sceneId) => {
    if(sceneId !== -1) {
        scene = gameScenes[sceneId]
        currentScene = scene
        queuedSceneId = -1;
    }
    $('#sceneLabel').text(scene.label);
    $('#sceneDisplay').text(scene.displayText);
    $('#sceneChoices').empty()
    $('#sceneChoiceResult').empty()
    $('#sceneContinueBtn').hide().prop('disabled', true);

    scene.choices.forEach(choice => {
        let passCondition = choice.condition;

        if (playerChoicesUsed
            .filter(usedChoice => usedChoice._id == choice._id)
            .filter(usedChoice => usedChoice.scene == currentScene._id)
            .length !== 0 && !choice.canRepeat) {
                passCondition = false;
        }

        if (passCondition || !choice.hideOnConditionFail) {
            $("<button>", {
                "class": 'scene-choice-btn',
                "choice-id": choice._id,
                "disabled": passCondition ? false : true
            })
            .text(choice.displayText)
            .appendTo($('#sceneChoices'));


        }
    })
}

const QueueChoice = (choiceId) => {
    if (!currentScene.choices || currentScene.choices.filter(choice => choice._id == choiceId).length === 0) {
        alert("A fatal error has occured. Invalid choice.");
    } else {
        $('.scene-choice-btn').prop('disabled', true);
        playerChoicesUsed.push({
            scene: currentScene._id,
            _id: choiceId
        })
        DisplayChoiceResults(choiceId)
    }
}

const DisplayChoiceResults = (choiceId) => {
    let choice = currentScene.choices[choiceId];
    queuedSceneId = choice.resultLink

    $('#sceneChoiceResult').text(choice.resultText);
    $('#sceneContinueBtn').show().prop('disabled', false);

    if (choice.resultEvents) {
        choice.resultEvents.forEach(resultEvent => {
            RunGameEvent(resultEvent);
        })
    }
}

const ConfirmChoiceResults = () => {
    RenderScene(queuedSceneId);
}

const InitGame = () => {

    playerMoney = 0;

    RenderScene(0);
    UpdatePlayerState();
}


$(document).ready(function () {
    InitGame();

    $(document).on('click', '.scene-choice-btn', function () {
        let queuedChoiceId = parseInt($(this).attr('choice-id'));
        QueueChoice(queuedChoiceId);
    });

    $('#sceneContinueBtn').click(ConfirmChoiceResults);
})