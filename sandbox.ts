const extractValues = (str: string): Record<string, unknown> => {
  const regex = /(\w+)=(?:(true|false)|(\d+(?:\.\d+)?)|("([^"\\]*(?:\\.[^"\\]*)*)"))/g;
  const args: Record<string, unknown> = {};
  let match;
  while ((match = regex.exec(str)) !== null) {
    const [, key, boolValue, numValue, strValue] = match;
    if (boolValue !== undefined) {
      args[key] = boolValue === "true";
    } else if (numValue !== undefined) {
      args[key] = parseFloat(numValue);
    } else if (strValue !== undefined) {
      args[key] = strValue
        .replace(/\\"/g, '"')    // Turn escaped quotes into quotes.
        .replace(/(^")|("$)/g, "");  // Remove quotes from the start and end of the string.
    }
  }
  return args;
};

const str = '[P:I pa="postLink" pb="string-with-dashes" pc="string with escaped \\" quotes" pd=2 pe=3.14 pf=true pg=false]';
console.log(extractValues(str));
