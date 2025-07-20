
export const extractVariables = (text: string): string[] => {
  const regex = /{{\s*([^}]+?)\s*}}/g;
  const matches = text.match(regex);
  if (!matches) {
    return [];
  }
  const variables = matches.map(match => match.replace(/{{\s*|\s*}}/g, ''));
  return [...new Set(variables)];
};

export const renderPreview = (templateBody: string, values: Record<string, string>): string => {
  if (!templateBody) return '';
  return templateBody.replace(/{{\s*([^}]+?)\s*}}/g, (match, variableName) => {
    return values[variableName] || '';
  });
};
