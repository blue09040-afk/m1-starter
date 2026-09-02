export class TextPatchFallbackError extends Error{constructor(message){super(message);this.name="TextPatchFallbackError"}}
export async function textOnlyPatchFallback(){throw new TextPatchFallbackError("The starter runtime does not bundle the advanced text-only patch fallback. Use the normal Kordoc patch path or add the full fallback module in your own repository after review.")}
