import {SR} from "../constants";
import {SR6Item} from "../item/SR6Item";

export class MatrixRules {
    /**
     * Calculate the matrix condition monitor based on SR5#228 'Matrix Damage'
     *
     * The result is round up as for physical and stun monitor (SR5#101), even though it's not specified for
     * matrix monitors specifically.
     *
     * @param deviceRating The device rating of the matrix device for the condition monitor.
     * @return The condition max condition monitor value
     */
    static getConditionMonitor(deviceRating: number): number {
        deviceRating = Math.max(deviceRating, SR.attributes.ranges.host_rating.min);
        return Math.ceil(8 + (deviceRating / 2));
    }

    /**
     * Derive the IC device rating based of it's hosts rating based on SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICDeviceRating(hostRating: number): number {
        return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Derive the IC initiative base value of it's host based on SR5#230 'Hot-SIM VR' and SR5#247 'Intrusion Countermeasures'
     *
     * @param hostRating A positive host rating.
     */
    static getICInitiativeBase(hostRating: number): number {
        return Math.max(hostRating * 2, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Get the amount of initiative dice IC has based on SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICInitiativeDice(): number {
        return Math.max(SR.initiatives.ic.dice, SR.initiatives.ranges.dice.min);
    }

    /**
     * Derive the base value of any meat attribute an IC uses based on SR5#237 'Matrix actions', SR5#256 'Agents'
     * and SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICMeatAttributeBase(hostRating: number): number {
        return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Determine if the count of marks (to be placed) is allowed within the rules. SR5#240 'Hack on the Fly'
     * @param marks
     */
    static isValidMarksCount(marks: number): boolean {
        return marks >= MatrixRules.minMarksCount() && marks <= MatrixRules.maxMarksCount() && marks % 1 === 0;
    }

    static maxMarksCount(): number {
        return 3;
    }

    static minMarksCount(): number {
        return 0;
    }

    static getValidMarksCount(marks: number): number {
        marks = Math.min(marks, MatrixRules.maxMarksCount());
        return Math.max(marks, MatrixRules.minMarksCount());
    }

    /**
     * Derive a hosts attributes ratings based on it's host rating. SR5#247 'Host Attributes'
     * @param hostRating
     */
    static hostMatrixAttributeRatings(hostRating): number[] {
        return [0, 1, 2, 3].map(rating => rating + hostRating);
    }

    /**
     * Determine if a program is a hacking program
     * @param program The program item to check
     * @returns True if the program is a hacking program
     */
    static isHackingProgram(program: SR6Item): boolean {
        if (program.type !== 'program') return false;

        // Check if the program's type is explicitly set to 'hacking_program'
        if (program.system?.type === 'hacking_program') return true;

        // If we can't determine the type, assume it's not a hacking program
        return false;
    }

    /**
     * Check if a matrix action test should accrue overwatch
     * @param categories The action categories to check
     * @returns True if the action is a matrix action
     */
    static isMatrixAction(categories: string[]): boolean {
        if (!categories || !categories.length) return false;

        // Matrix action categories
        const matrixCategories = [
            'matrix',
            'matrix_action',
            'matrix_defense',
            'matrix_initiative',
            'matrix_perception',
            'matrix_search',
            'hack_on_the_fly',
            'brute_force',
            'data_spike',
            'crack_file',
            'matrix_stealth',
            'matrix_confuse_persona',
            'matrix_jump_into_rigged_device',
            'matrix_control_device',
            'matrix_format_device',
            'matrix_reboot_device',
            'matrix_full_matrix_defense',
            'matrix_hide',
            'matrix_jack_out',
            'matrix_jam_signals',
            'matrix_spoof_command',
            'matrix_trace_icon'
        ];

        return categories.some(category => matrixCategories.includes(category));
    }

    /**
     * Check if a matrix action is illegal based on its legality attribute
     * @param action The action data to check
     * @returns True if the action is an illegal matrix action
     */
    static isIllegalMatrixAction(action: Shadowrun.ActionRollData): boolean {
        // Check if the action has a legality attribute set to 'illegal'
        if (action.legality === 'illegal') return true;

        // If no legality attribute is set, fall back to checking categories
        if (action.categories && action.categories.length > 0) {
            // Cracking-based categories that indicate illegal actions
            const illegalCategories = [
                'hack_on_the_fly',
                'brute_force',
                'data_spike',
                'crack_file',
                'matrix_stealth'
            ];

            return action.categories.some(category => illegalCategories.includes(category));
        }

        return false;
    }
}