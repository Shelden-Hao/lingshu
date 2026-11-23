// A plugin importing Chord directly: refused, pointing to the app's API (which re-exports what plugins may use).

import { defineFacet } from "@lingshu/chord";

export default defineFacet(() => {});
