export function extractQueryList(text: string) {
  return text
    .split('\n')
    .map((str) =>
      str
        .trim()
        .replace(/^query /, '✓query ')
        .replace(/^mutation /, '✓mutation ')
        .replace(/^fragment /, '✓fragment '),
    )
    .join(' ')
    .replace(/✓mutation /g, '\nmutation ')
    .replace(/✓query /g, '\nquery ')
    .replace(/✓fragment /g, '\nfragment ')
    .trim()
    .split('\n');
}
