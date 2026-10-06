// Script and style blocks go with their content: stripping only the tags would leave the code behind as text.
const CODE_BLOCKS = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const TAGS = /<\/?[a-z!][^>]*>/gi;

export const toPlainText = (value: string): string =>
    value.replace(CODE_BLOCKS, "").replace(TAGS, "");
