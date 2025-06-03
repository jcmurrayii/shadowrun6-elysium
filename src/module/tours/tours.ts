import Sr5Tour from "./sr6Tours";

export default async function registerSR5Tours() {
  try {

     // @ts-expect-error
    game.tours.register(
      'sr6elysium',
      'ConditionMonitor',
       // @ts-expect-error
      await Sr5Tour.fromJSON('/systems/sr6elysium/dist/tours/ConditionMonitor.json'),
    );


//      game.tours.register(
//       'sr6elysium',
//       'CharacterImport',
//        // @ts-expect-error
//       await Sr5Tour.fromJSON('/systems/sr6elysium/dist/tours/character-import.json'),
//     );
//

  } catch (err) {
    console.log(err);
  }
}
