

import React from 'react';

export const FormatDate = ({ date, systemDate }: { date: string, systemDate?: string }) => {
    if (date === undefined || date === null || date === '') return null;
    // Se la data è un numero, è un timestamp
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
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return <>{`${hours}:${minutes}`}</>;
    }
    if (isTomorrow) {
        return <>domani</>;
    }
    // Se la data è nell'anno successivo rispetto a systemDate, mostra anche l'anno
    const isNextYear = d.getFullYear() > sys.getFullYear();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    if (isNextYear) {
        return <>{`${day}/${month}/${d.getFullYear()}`}</>;
    }
    return <>{`${day}/${month}`}</>;
}

export default FormatDate;