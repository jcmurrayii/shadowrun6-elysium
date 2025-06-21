export class PartyHud extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'party-hud';
        options.classes = ['sr6'];
        options.title = game.i18n.localize('SR6.PartyHud');
        options.template = 'systems/sr6elysium/dist/templates/apps/partytools/party-hud.html';
        options.width = 450;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    getData() {
        return {
            actors: this._getPartyActors()
        };
    }

    activateListeners(html) {
        html.find('.party-hud-actor').on('click', this._onSelectActor.bind(this));
    }

    _getPartyActors() {
        return game.actors?.filter(actor => actor.hasPlayerOwner);
    }

    _onSelectActor(event) {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.actorId;
        const actor = game.actors?.get(actorId);
        if (actor) {
            actor.sheet.render(true);
        }
    }
}
