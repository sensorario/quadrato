

export enum STATUS_ENUM {
    TODO = 0,
    IN_PROGRESS = 1,
    DONE = 2,
    SKIPPED = 3
}

import { STATUS_DEFAULT } from './themes/statusDefault';
import { STATUS_CHECKED } from './themes/statusChecked';
import { STATUS_PANDA } from './themes/statusPanda';

// Funzione per ottenere lo STATUS corretto
export function getStatusIcons(theme: 'default' | 'checked' | 'panda' = 'default') {
    if (theme === 'checked') return STATUS_CHECKED;
    if (theme === 'panda') return STATUS_PANDA;
    return STATUS_DEFAULT;
}