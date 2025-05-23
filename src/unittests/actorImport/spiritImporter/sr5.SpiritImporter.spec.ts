import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../../module/apps/importer/actorImport/spiritImporter/SpiritImporter';
import { SR6TestingDocuments } from '../../utils';
import { SR6Actor } from '../../../module/actor/SR6Actor';
import { SR6Item } from '../../../module/item/SR6Item';
import { emptySpirit } from './spirits';


export const spiritImporterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActor;
    const actorType = 'spirit';

    const importOptions = {};
    let chummerFile;

    before(async () => {
        testActor = new SR6TestingDocuments(SR6Actor);
    });

    beforeEach(async () => {
        chummerFile = structuredClone(emptySpirit);
    });

    after(async () => {
        await testActor.teardown();
    });

    describe('Chummer Spirit Importer', () => {
        const testItem = new SR6TestingDocuments(SR6Item);

        it('Does nothing when no character found', async () => {
            const item = await testItem.create({ type: 'weapon' });
            const character = await testActor.create({ type: actorType });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);
            // @ts-expect-error
            assert.strictEqual(character.items.contents[0].name, item.name);
            // @ts-expect-error
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all items no actions present', async () => {
            const item = await testItem.create({ type: 'weapon' });
            const character = await testActor.create({ type: actorType });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.isEmpty(character.items);
        });

        it('Clears all items but actions', async () => {
            const item = await testItem.create({ type: 'action' });
            const character = await testActor.create({ type: actorType });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            // @ts-expect-error
            assert.strictEqual(character.items.contents[0].name, item.name);
            // @ts-expect-error
            assert.strictEqual(character.items.contents[0].type, item.type);
        });
    });
};
