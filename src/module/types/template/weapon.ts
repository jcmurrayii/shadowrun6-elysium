declare namespace Shadowrun {
    export type RangesTemplateData = {
        short: RangeTemplateData,
        medium: RangeTemplateData,
        long: RangeTemplateData,
        extreme: RangeTemplateData,
    }

    export type RangeTemplateData =
        LabelField &
        ModifierField & {
        distance: number
    }

    interface RangeDescription {
        label: string;
        distance: number;
        modifier: number;
        category: string;
    }

    interface TargetRangeTemplateData {
        tokenUuid: string;
        name: string;
        unit: string;
        range: RangeDescription;
        distance: number;
    }
}
