

import React from 'react';
import { useTranslation } from 'react-i18next';

export const FormatDate = ({ date, systemDate }: { date: string | number, systemDate?: string }) => {
    const { t, i18n } = useTranslation();
    if (date === undefined || date === null || date === '') return null;
    // Se la data è un numero, è un timestamp in millisecondi
    const d = typeof date === 'number' ? new Date(date) : new Date(date);
    let sys: Date;
    if (systemDate) {
        sys = new Date(systemDate);
    } else {
        const now = new Date();
        sys = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Controlla se la data è oggi
    const isToday = d.getFullYear() === sys.getFullYear() && d.getMonth() === sys.getMonth() && d.getDate() === sys.getDate();

    // Controlla se la data è domani rispetto a systemDate
    const tomorrow = new Date(sys);
    tomorrow.setDate(sys.getDate() + 1);
    const isTomorrow = d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();

    if (isToday) {
        return <>{new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)}</>;
    }
    if (isTomorrow) {
        return <>{t('formatDate.tomorrow')}</>;
    }
    // Se la data è nell'anno successivo rispetto a systemDate, mostra anche l'anno
    const isNextYear = d.getFullYear() > sys.getFullYear();
    if (isNextYear) {
        return <>{new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)}</>;
    }
    return <>{new Intl.DateTimeFormat(i18n.language, { day: '2-digit', month: '2-digit' }).format(d)}</>;
}

export default FormatDate;
