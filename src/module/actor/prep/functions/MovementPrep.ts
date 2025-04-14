import MovementActorData = Shadowrun.MovementActorData;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import {PartsList} from "../../../parts/PartsList";

export class MovementPrep {
    static prepareMovement(system: ActorTypesData & MovementActorData) {
        const { modifiers } = system;

        const movement = system.movement;
        // In SR6e, movement is standardized: WALK = 10, RUN = 15
        movement.walk.value = 10 + Number(modifiers['walk']) + new PartsList(movement.walk.mod).total;
        movement.run.value = 15 + Number(modifiers['run']) + new PartsList(movement.run.mod).total;
    }
}
