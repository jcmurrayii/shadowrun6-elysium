# Local development environment

## General development
The main development workflow uses a build system using npm and gulp with Github pull requests required for changes made. Should you have issues while setting it up, please web search first.

sr6elysium uses Typescript (with esbuild), npm with gulp and git.

You'll have to install node.js (npm) (Use node v18! v20 seems to cause issues) and git: 
* Node v18: [https://nodejs.org/download/release/v18.18.2/node-v18.18.2-x64.msi](https://nodejs.org/download/release/v18.18.2/node-v18.18.2-x64.msi)
* [https://git-scm.com/download/](https://git-scm.com/download/)

Follow these steps using your terminal (cmd.exe on Windows):
* `npm install --global gulp-cli`
* Follow this manual on how to work with a Github forking and cloning, git branches and Github pull requests ([https://opensource.com/article/19/7/create-pull-request-github](https://opensource.com/article/19/7/create-pull-request-github))
* `git clone <the_fork_url_on_your_github`
* `cd <the_cloned_fork_directory>`
* `npm install` (this will take a while)
* `gulp watch`
* Start developing (you might want to link your dev and local systems folder)

There are multiple gulp tasks available to help development:
* watch => rebuild the system after a change is detected (code and `/public` data)
* build => rebuild the system once
* link => See section below

The resulting application used for FoundryVTT will only use contents in `/dist`.

## Linking the dev and system folder
It's helpful, but not strictly necessary, to place your development folder separate from the FoundryVTT system folder as a system update will overwrite your development folder otherwise. This can be done with linking the two. For both options to work, the sr6elysium system can't be installed in your local Foundry.

### Option A: gulp link 
For the `gulp link` command to work, you need to include the following file as _foundryconfig.json_ directly underneath your development sr6elysium system directory.
`{
  "dataPath": "C:\\Users\\<addYourUserHere>\\AppData\\Local\\FoundryVTT\\",
  "linkTargetDirName": "sr6elysium"
}
`

### Option B: (Windows) mklink
Instead of using the built in `gulp link` command, you can also execute this from within your `cmd` or `Windows Terminal`:
`mklink /D "C:\Users\<yourUser>\AppData\Local\FoundryVTT\Data\systems\sr6elysium" "<yourClonedRepoPath>"`

<yourClonedRepoPath> must be the cloned repository that includes the `dist` folder within it.

## ESLint / Prettier

This project uses ESLint and Prettier to enforce code style and formatting.

It is strongly recommended to set up Prettier and ESLint in your IDE to run automatically as you develop. ESLint is also ran as part of the PR build pipeline.

The relevant commands are:
 * `npm run lint`: Run the linter, outputting all errors and warnings
 * `npm run lint:fix`: Run the linter, fixing all errors and warnings it can auto-fix and outputting the rest
 * `npm run lint:errors`: Run the linter, outputting only errors
 * `npm run lint:errors:fix`: Run the linter, fixing all errors it can auto-fix and outputting the rest
 * `npm run prettier`: Run prettier, auto-formatting your changeset

# System Architecture
A broad overview of the different areas of the sr6elysium system. For more explanations around system specific concepts see `System Concepts`.
## Folder structure
Everything needed to execute the system within foundry must live under 
* `/dist`
FoundryVTT compendium packs are used as is:
- `/packs`
Data that needs to be copied into `/dist` as is during build:
* `/public`
Source code 
- `/src`


## Translations
The FoundryVTT language config files used by Foundry will be at `/dist/lang/<language>/config.json`. The `/dist` directory does only exist on releases and changes made here to language files won't be accepted into the GitHub repository. Instead, use `/public/lang/<language>/config.json` as these are copied over to `/dist/lang` when running `gulp build` or `gulp watch`.

In order to get your translation changes to the `/public` language files into the system, you'll have to create a GitHub pull request against the systems `master`/`main` branch. 

## Separation
More and more parts of the system move to separate modules organized into these broad layers:
All following folder reference are relative to src\module\*
* Rules layer. Shouldn't contain any references to Foundry objects. At best system objects should be used (like a PartsList)
  These live in the rules\ folder
* Flow layer. Should use the rules modules to introduce an order of operations for them and collect and output information. This will contain Foundry objects. These live in item\flows and actor\flows.
* Application layer. Handle interface operations. Dialogs. Application windows. Chat Message creation and so forth.
* Tests layer. Whenever any Shadowrun test is implemented it should extend the SuccessTest class. All tests live in the tests\ folder. See `Test Implementation` for more details.

Additional separations are made for
* Initial data generation of items or template partials

## Branches and Pull Requests
We'll gladly accept pull requests for all things moving the system forward. :)

The system branch workflow is simple:
`master` is the main and stable branch that is *safe* to pull from and is meant to adress your pull requests into. It's setup with an GitHub action performing a TypeScript build dry run; this action has to succeed for any pull request to be considered.

`release/**` is the active branch for upcoming releases. It's temporary and will be removed once merged into `master`. If you're actively working on changes for that release, you can pull from it and address your pull request into it. It's setup using the same GitHub action as `master`. You should only pull from this branch, if you need commits in its history. Otherwise, use `master`.

## Unittesting
There is unit testing support using the FVTT Quench module. It's encouraged to do some unit testing where possible but it's not mandatory. Rule modules should always contain some testing, while flow modules are encouraged to have some. Any application layers don't need testing. See the structure section for some broad overview over different layers / modules. 

Afterwards open a terminal (cmd.exe on Windows) with administrative permissions ([see here for help](https://www.howtogeek.com/194041/how-to-open-the-command-prompt-as-administrator-in-windows-8.1/)):
* `cd <the_cloned_fork_directory>`
* `gulp link` (should this fail, remove the existing sr6elysium system or check for administrative permissions)

You should see a success message and a little arrow symbol on the sr6elysium folder within the FoundryVTT _Data/systems_ directory. Now you can use the Gulp watch-Task as described above. This needs to be repeated after each sr6elysiumVTT system update.


## Linux and docker workflow changes
> **NOTE:** This approach is considered legacy and not actively used anymore. @taMiF left it here for your consideration.

On Linux you can use `docker` (or another container runtime like `podman`) to
quickly set up a local instance of `foundry`:

This will use `docker-compose` (or `podman-compose`) to manage the containers.

It requires some manual setup to make the `foundryvtt.zip` avaiable for
installation:

1. Create a `data` and a `data/cache` directory - this will host all files of
   the installation: `mkdir -p data/cache`
2. Download the desired version of foundry from your account as `zip` and place
   it inside the `data/cache` folder (this version has to match the version of
   the container-image in `docker-compose.yml`):

``` sh
wget -O data/cache/foundryvtt-$SOME_VERSION.zip $URL_TO_DOWNLOAD_LINK
```
3. Spin up `foundryvtt` using `docker-compose`:

``` sh
# This command must be run inside the root directory of this repository
# It will automatically symlink this system into data/Data/systems
docker-compose up
```

Now an instance of `foundryvtt` will be running on http://localhost:30000

If you need to restart the instance:

``` sh
docker-compose down
docker-compose up
```

# System Concepts
General concepts as used in the sr6elysium system.
## Test implementation (Success Test)
The sr6elysium system implements Shadowrun 5e Success Tests as implementations of the `SuccessTest` class. These implementations are connected to items containing `action` segments. An `action` segment defines values and implementations to use for all tests related to that action.

While a `SuccessTest` implementation doesn't need an `action` to function, it's advised to trigger tests via casting actions.

For further details see the `SuccessTest` class docs and `TestCreation` docs.
### General structure
* Anything testable defines an action
* An action can have multiple tests connected to it:
  * An active test
  * A followup to the active test
  * An opposed test
  * A resist test for the opposed test
* Each of these defines at least what test to use and allows for skill/attributes to be configured, should the user want to
* If there is no user configured test action default action values will be used that are connected to the test implementation
* All test implementations are registered within `game['sr6elysium'].tests` and only taken and created from there
* Modules can, in theory, overwrite a registered test implementation by replacing the implementation for a test within that registry
### Test creation
If you don't know how to create a `SuccessTest` implementation the helper function within `TestCreator` available at `game['sr6elysium'].test`
provide a few different options. These are meant as system internal helpers to simplify the different ways to create tests
into one helper and not pollute the general `SuccessTest` class.
#### Value application
Tests can be created with values from these sources:
- action
- test action defaults
- test action based on documents

These different value providers will be merged in order of distance to the user by `TestCreator`, allowing a test implementation to take values from all of these sources and overwrite only those necessary. The closest user distance is given by the action, followed by the documents.

### Class structure
Everything is based on the `SuccessTest` class, which defines general testing flow and also handles Foundry related interaction.

The different Shadowrun 5 test types are created using subclasses:
- OpposedTest
- TeamworkTest
### Test flow
Triggering an active success test through an action will always show a dialog and chat message, both of which are optional.

Should the action define a followup test, it will be initiated immediately for the active user.

Opposing tests must be triggered manually by targeted actors through the chat message of the original active success test. Should the original action define a resist test, it will be initiated immediately for the opposing user.

These behaviors are implemented within the `SuccessTest` and `OpposedTest` base classes and can be altered by implementing classes.

### Actions and tests
Test implementations can be created fully without actions, though most players will trigger tests using any of the action items (action, weapon, spell, ...).

Values from actions are taken to create configured test implementation. In general whenever a test defines default values (attributes, skill, modifiers, categories) these can be fully overwritten by what the action configures the test to use. If an action is given no configuration for any of a value, the default value of the test implementation will be used.

### Tests and Active Effects
Active Effects can apply to tests, both in general and with a specific filter.

#### Test implementations
Active Effects can target specific test implementations. In this case, the effect will only apply to actions using these tests.

In general this should be used sparingly and is mostly a technical way of addressing tests. Instead, try using action categories. If you're missing an action category, inform us on our Discord channel on the FoundryVTT server or, better, the GitHub issues.

#### Categories
Tests and actions can have categories. These are used to give tests a set of labels, allowing them to be targeted by an Active Effect.

Typical use cases would be:
- matrix => a matrix action
- spell => any spell action
- social => any social skill action
- climbing => a climbing action

Categories can be mixed and matched at will and don't have to adhere to sr5 rules.

## Modifier implementation
The sr6elysium system has multiple ways of handling modifiers on actors, items and 'situations':
- actor local modifiers
- situational modifiers
  
To define what modifiers a Shadowrun 5e Test uses an `action` can define a set of modifiers to use. These modifiers will be taken using the actors `ModifiersFlow` handler, sitting in between tests and modifiers applied onto a document.
### Actor local modifiers
The legacy modifiers are flat values for actors, which are taken as is and can be prepared during Document prepareData.

Examples for these are modifiers for movement, armor and physical overflow.
### Situational modifiers
These modifiers depend upon the current situation a token / actor finds itself in at the moment. These can't be prepared beforehand but must be recalculated before values for each test can be used. They can be stored on all document types, but tend to be only on `Scene` and `SR6Actor` documents, which will be merged to a resulting situational modifier.

This allows GMs to define broad situation modifiers for all actors on a specific scene, while also allowing to change some or all modifiers on an per actor basis as well.

Examples for these are environmental, noise and recoil.
These modifiers can also be used to apply rules that need to recalculate between tests or combat turns or other changing events outside of an actors context or data preparation.

## Actions
Any item can contain the action template allowing it to cast it as a Shadowrun 5e success test.


# Extending compendium contents

FoundryVTT uses nedb to implement their compendiums, internally called packs. These nedb's are build from scratch on each release and need source document json files to be built from.

If changes are to be made on compendium items, you can either make those directly within their source file underneath `./packs/_source` or using Foundry GUI. To make these changes persistent, extract compendium content to their source using `node ./utils/packs.mjs package unpack`. Since source documents are stored using their name, be careful when changing that and compare their on disk name with expectations.

Since nedb packs aren't stored in git, changing pack contents will trigger changes for system compendiums as soon as the next GitHub release workflow is triggered.
