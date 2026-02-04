/**
 * JSON-LD recipe instruction step can be a string or an object with text/itemListElement.
 */
export type JsonLdInstructionStep =
  | string
  | {
      text?: string | string[];
      itemListElement?: Array<{ text?: string }>;
    };
