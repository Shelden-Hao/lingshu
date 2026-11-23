// The prices plugin's server facet: serves `Price`.

import { constant, defineFacet } from "@lingshu/chord";
import { Price } from "./contract.ts";

export default defineFacet((host) => host.serve(Price, () => ({ cents: constant(250) })));
