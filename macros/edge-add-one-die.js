const EDGE_COST = 1;

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

// Spend edge
await actor.useEdge(-EDGE_COST);

// Create chat message
await ChatMessage.create({
    content: `
        <div class="sr6 chat-card">
            <div class="card-title">Edge Action: Add +1 to Die</div>
            <div class="card-content">
                ${actor.name} spends ${EDGE_COST} Edge to add +1 to a single die result.<br>
                Edge remaining: ${edge.uses - EDGE_COST}
            </div>
        </div>`,
    speaker: ChatMessage.getSpeaker({actor: actor})
});