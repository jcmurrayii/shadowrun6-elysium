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

// Create and handle the dialog
new Dialog({
    title: "Edge Reroll",
    content: `
        <form>
            <div class="form-group">
                <label>Number of Dice to Reroll (Edge Available: ${edge.uses}):</label>
                <input type="number" name="diceCount" value="1" min="1">
            </div>
        </form>
    `,
    buttons: {
        roll: {
            icon: '<i class="fas fa-dice"></i>',
            label: "Reroll",
            callback: async (html) => {
                const diceCount = parseInt(html.find('[name="diceCount"]').val());
                
                // Check if actor has enough edge
                if (edge.uses < diceCount) {
                    ui.notifications.error(`Not enough Edge! Need ${diceCount} but only have ${edge.uses}`);
                    return;
                }

                // Roll the dice
                let roll = new Roll(`${diceCount}d6`);
                await roll.evaluate({async: true});

                // Count hits (5 or 6)
                const hits = roll.terms[0].results.filter(d => d.result >= 5).length;

                // Format dice results in SR6 style
                const diceHtml = roll.terms[0].results.map(d => {
                    const result = d.result;
                    const isHit = result >= 5;
                    const isCriticalGlitch = result === 1;
                    
                    return `
                        <span class="die ${isHit ? 'hit' : ''} ${isCriticalGlitch ? 'critical-glitch' : ''}">${result}</span>`;
                }).join('');

                // Spend edge
                await actor.useEdge(-diceCount);

                // Create chat message
                const content = `
                <div class="sr6 chat-card roll-card">
                    <div class="card-title card-header">
                        <span class="test-name">Edge Reroll</span>
                    </div>
                    <div class="card-content">
                        <div class="left-side">
                            <div class="test-value">
                                <span class="value">Dice Rerolled: </span>
                                <span class="value-result">${diceCount}</span>
                            </div>
                            <div class="test-value">
                                <span class="value">New Hits: </span>
                                <span class="value-result">${hits}</span>
                            </div>
                            <div class="test-value">
                                <span class="value">Edge Remaining: </span>
                                <span class="value-result">${edge.uses - diceCount}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-rolls">
                        <div class="roll-result">
                            ${diceHtml}
                        </div>
                    </div>
                </div>
                `;

                await ChatMessage.create({
                    content: content,
                    speaker: ChatMessage.getSpeaker({actor: actor}),
                    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                    roll: roll,
                    sound: CONFIG.sounds.dice
                });
            }
        },
        cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
        }
    },
    default: "roll"
}).render(true);