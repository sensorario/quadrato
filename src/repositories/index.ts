export const DATA_BACKEND = 'localstorage' as 'localstorage' | 'fake';

import LocalStorageConfigRepository from './localstorage/ConfigRepository';

export function getConfigRepository() {
    return LocalStorageConfigRepository;
}
