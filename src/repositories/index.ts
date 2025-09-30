export const DATA_BACKEND = 'localstorage' as 'localstorage' | 'fake';

import LocalStorageConfigRepository from './localstorage/ConfigRepository';
import FakeConfigRepository from './fake/ConfigRepository';

export function getConfigRepository() {
    if (DATA_BACKEND === 'fake') return FakeConfigRepository;

    return LocalStorageConfigRepository;
}
