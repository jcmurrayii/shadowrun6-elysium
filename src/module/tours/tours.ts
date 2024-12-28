import Sr5Tour from "./sr6Tours";

export default async function registerSR5Tours() {
  try {

     // @ts-expect-error
    game.tours.register(
      'shadowrun6-elysium',
      'ConditionMonitor',
       // @ts-expect-error
      await Sr5Tour.fromJSON('/systems/shadowrun6-elysium/dist/tours/ConditionMonitor.json'),
    );


//      game.tours.register(
//       'shadowrun6-elysium',
//       'CharacterImport',
//        // @ts-expect-error
//       await Sr5Tour.fromJSON('/systems/shadowrun6-elysium/dist/tours/character-import.json'),
//     );
//

  } catch (err) {
    console.log(err);
  }
}
