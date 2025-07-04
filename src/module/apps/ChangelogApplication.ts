import {FLAGS, SYSTEM_NAME} from "../constants";

export class ChangelogApplication extends Application {
    override get template(): string {
        return 'systems/sr6elysium/dist/templates/apps/changelog.html';
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = ['sr6elysium'];
        options.title = game.i18n.localize('SR6.ChangelogApplication.Title');
        options.width = 500;
        options.height = 'auto';
        return options;
    }

    override render(force?: boolean, options?: Application.RenderOptions) {
        ChangelogApplication.setRenderForCurrentVersion();
        return super.render(force, options);
    }

    // Let the async operation happen in background.
    private static setRenderForCurrentVersion() {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        game.user?.setFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion, game.system.version);
    }

    static get showApplication(): boolean {
        if (!game.user?.isGM || !game.user?.isTrusted) return false;

        const shownForVersion = game.user?.getFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion);
        //@ts-expect-error // TODO: foundry-vtt-types v10
        return shownForVersion !== game.system.version;
    }
}
