const EDGE_COST = 2;

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

// Get targeted token
const targets = game.user.targets;
if (targets.size !== 1) {
    ui.notifications.error("Please target exactly one ally");
    return;
}

const targetActor = Array.from(targets)[0].actor;
if (!targetActor) {
    ui.notifications.error("Invalid target");
    return;
}

// Give edge to ally
await actor.useEdge(-EDGE_COST);
await targetActor.useEdge(1);

// Create chat message
await ChatMessage.create({
    content: `
        <div class="sr6 chat-card">
            <div class="card-title">Edge Action: Give Edge to Ally</div>
            <div class="card-content">
                ${actor.name} spends ${EDGE_COST} Edge to give 1 Edge to ${targetActor.name}.<br>
                Edge remaining: ${edge.uses - EDGE_COST}
            </div>
        </div>`,
    speaker: ChatMessage.getSpeaker({actor: actor})
});