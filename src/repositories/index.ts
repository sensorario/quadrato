export const DATA_BACKEND = 'localstorage' as 'localstorage' | 'fake';

// import LocalStorageRepository from './LocalStorageRepository';
import AjaxRepository from './AjaxRepository';

export function getConfigRepository() {
    // return LocalStorageRepository;
    return AjaxRepository;
}
