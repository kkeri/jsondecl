import { ModuleLoader } from './loader'

const defaultLoader = new ModuleLoader()

export const compile = defaultLoader.compile.bind(defaultLoader)
export const load = defaultLoader.load.bind(defaultLoader)
export { ModuleLoader } from './loader'
