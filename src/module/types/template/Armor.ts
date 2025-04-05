declare namespace Shadowrun {
    export type ActorArmorData = BaseValuePair<number> & ModifiableValue & LabelField

    export type ActorArmor = ActorArmorData & {
        defense_rating: ModifiableValue,
        social_rating: ModifiableValue,
        capacity: number,
        fire: number,
        electric: number,
        cold: number,
        acid: number,
        label?: string,
        hardened: boolean
    }
}
