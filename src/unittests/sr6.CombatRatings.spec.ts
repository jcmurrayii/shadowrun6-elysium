import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SYSTEM_NAME } from '../module/constants';
import { Helpers } from '../module/helpers';
import { PartsList } from '../module/parts/PartsList';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6Item } from '../module/item/SR6Item';
import { SR6TestingDocuments } from './utils';

/**
 * Tests for attack rating and defense rating calculations
 * 
 * @param context Quench test context
 */
export const shadowrunCombatRatingsTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR6TestingDocuments(SR6Actor);
        testItem = new SR6TestingDocuments(SR6Item);
    });

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    });

    // Test sections will be added here
};
