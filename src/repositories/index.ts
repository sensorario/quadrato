// import LocalStorageConfigRepository from './localstorage/ConfigRepository';
import AjaxRepository from "./localstorage/AjaxRepository";

export function getConfigRepository() {
    // return LocalStorageConfigRepository;
    const repository = AjaxRepository;

    if (repository.requireAttention()) {
        console.log("Using AjaxRepository as it requires attention.");
    }

    return repository;
}
