let playerMoney = 0;
let playerChoicesUsed = [
    // {scene: 0, _id: 0},
];
let playerScenesVisited = [
    // { _id: 0 }
]
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

const CheckGameCondition = () => {

    const conditionList = [
        'EVALUATE_MONEY',
        'EVALUATE_ITEM',
        'SKILL_CHECK'
    ]

    switch(type) {

        case('EVALUATE_MONEY'):
            
        default:
            break;
    }
}

const gameScenes = [
    {
        _id: 0,
        label: "Prologue",
        displayText: "You awaken in the middle of a forest with no idea of how you got there. It looks to be midday. You see a man-made road with a sign indicating the presence of a nearby town.",
        displayTextVisited: "You are still in the middle of the forest.",
        backgroundImage: "background-000.jpg",
        choices: [
            {
                _id: 0,
                canRepeat: false,
                displayText: "Look around for clues.",
                condition: true,
                hideOnConditionFail: false,
                resultText: "You search the ground around you. Nothing to help make sense of your situation, but oh look, you found 40 bucks!",
                resultLink: -1, // -1 to stay on current area
                resultEvents: [
                    { type: 'MODIFY_MONEY', value: 40}
                ]
            },
            {
                _id: 1,
                canRepeat: false,
                displayText: "Begin following the road.",
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
        backgroundImage: "background-001.jpg",
        choices: [
            {
                _id: 0,
                canRepeat: false,
                displayText: "Keep Walking",
                condition: true,
                hideOnConditionFail: false,
                resultText: "You begin to quicken your pace. Looks like an ugly storm cloud on the horizon, hopefully you can find an inn before it rains.",
                resultLink: 2
            }
        ]
    },
    {
        _id: 2,
        label: "Town Outskirts",
        displayText: "You begin walking on the road when something exciting happens.",
        backgroundImage: "background-002.jpg",
    }
]


const RenderScene = (sceneId) => {
    if(sceneId !== -1) {
        scene = gameScenes[sceneId]
        currentScene = scene
        queuedSceneId = -1;
    }

    let sceneText = scene.displayText
    
    if (playerScenesVisited.includes(scene._id)) {
        if (scene.displayTextVisited) { sceneText = scene.displayTextVisited; } 
    } else {
        playerScenesVisited.push(scene._id);
    }

    $('#sceneLabel').text(scene.label);
    $('#sceneDisplay').text(sceneText);
    $('#sceneChoices').empty()
    $('#sceneChoiceResult').empty()
    $('#sceneContinueBtn').hide().prop('disabled', true);
    $('#sceneBackground').css('background-image', `url('images/${scene.backgroundImage}')`);

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