const EDGE_COST = 4;

// Get the selected token's actor
const actor = token?.actor || character;
if (!actor) {
    ui.notifications.error("Please select a token or assign a character");
    return;
}

// Get edge data
const edge = actor.getEdge();
if (!edge) {
    ui.notifications.error("Selected character has no Edge attribute");
    return;
}

// Check if actor has enough edge
if (edge.uses < EDGE_COST) {
    ui.notifications.error(`Not enough Edge! Need ${EDGE_COST} but only have ${edge.uses}`);
    return;
}

// Get edge attribute value
const edgeAttr = actor.system.attributes.edge.value;
if (!edgeAttr) {
    ui.notifications.error("Could not determine Edge attribute value");
    return;
}

// Roll edge attribute dice
let roll = new Roll(`${edgeAttr}d6`);
await roll.evaluate({async: true});

// Count hits and check for glitch
const results = roll.terms[0].results;
const hits = results.filter(d => d.result >= 5).length;
const ones = results.filter(d => d.result === 1).length;
const isGlitch = ones >= Math.ceil(results.length / 2);

// Format dice results
const diceHtml = results.map(d => {
    const result = d.result;
    const isHit = result >= 5;
    const isCriticalGlitch = result === 1;
    return `<span class="die ${isHit ? 'hit' : ''} ${isCriticalGlitch ? 'critical-glitch' : ''}">${result}</span>`;
}).join('');

// Spend edge
await actor.useEdge(-EDGE_COST);

// Create chat message
const content = `
<div class="sr6 chat-card roll-card">
    <div class="card-title card-header">
        <span class="test-name">Edge Action: Add Edge Attribute</span>
    </div>
    <div class="card-content">
        <div class="left-side">
            <div class="test-value">
                <span class="value">Edge Dice Rolled: </span>
                <span class="value-result">${edgeAttr}</span>
            </div>
            <div class="test-value">
                <span class="value">Hits: </span>
                <span class="value-result">${hits}</span>
            </div>
            ${isGlitch ? `<div class="test-value"><span class="value">Glitch!</span></div>` : ''}
            <div class="test-value">
                <span class="value">Edge Remaining: </span>
                <span class="value-result">${edge.uses - EDGE_COST}</span>
            </div>
        </div>
    </div>
    <div class="card-rolls">
        <div class="roll-result">
            ${diceHtml}
        </div>
    </div>
</div>`;

await ChatMessage.create({
    content: content,
    speaker: ChatMessage.getSpeaker({actor: actor}),
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    roll: roll,
    sound: CONFIG.sounds.dice
});