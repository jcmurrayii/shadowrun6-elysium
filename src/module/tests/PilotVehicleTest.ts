import {SuccessTest} from "./SuccessTest";
export class PilotVehicleTest extends SuccessTest {
    /**
     * Piloting a vehicle will alter the kind of test that needs to be made based on a few factors.
     *
     * @param item The testing item to cast
     * @param actor The vehicle actor to be casting with
     */
    static override async _getDocumentTestAction(item, actor) {
        // Both item and actor are needed to determine what to roll.
        if (!item || !actor) return {};

        const vehicleData = actor.asVehicle();
        if (!vehicleData) {
            await ui.notifications?.error(game.i18n.localize('SR6.Errors.TestExpectsVehicleOnly'))
            return {};
        }

        switch (vehicleData.system.controlMode) {
            case "autopilot": {
                const attribute = 'pilot';
                const skill = actor.getVehicleTypeSkillName();
                const limit = {attribute: vehicleData.system.environment};

                return {attribute, skill, limit};
            }

            default:
                const skillId = actor.getVehicleTypeSkillName();
                return actor.skillActionData(skillId);
        }
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['rigging']
    }
}
