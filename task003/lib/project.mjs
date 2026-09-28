// Resolves the project folder the tools work on: PROJECT=cat node tools/xyz.mjs (default: pagoda)
export const ROOT = new URL('../', import.meta.url).pathname;           // task003/
export const PROJECT = process.env.PROJECT || 'pagoda';
export const PDIR = ROOT + PROJECT + '/';
export const config = (await import(PDIR + 'project.mjs')).default;
