import { moduleRunnerTransform } from "vite";

export const FormatDate = ({ date }: { date: string }) => {
    if (!date) return '';
    const today = new Date();
    const d = new Date(date);

    const todayDate = today.toLocaleString('it-IT', {
        month: '2-digit',
        day: '2-digit',
    });

    let referralDate = d.toLocaleString('it-IT', {
        month: '2-digit',
        day: '2-digit',
        hour12: false
    });

    if (date === todayDate) {
        referralDate = d.toLocaleString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(/\//g, '-');
    }

    // @todo mostrare "tra tre giorni" "fra n mesi"
    // @todo ...

    // Calcola la differenza in giorni
    const daysDifference = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDifference > 0 && daysDifference < 1) {
        referralDate = d.toLocaleString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } else if (daysDifference >= -2 && daysDifference < -1) {
        referralDate = 'domani';
    } else if (daysDifference >= -14 && daysDifference < -7) {
        referralDate = 'la prossima settimana';
    } else if (daysDifference >= -60 && daysDifference < -30) {
        referralDate = 'tra un mese';
    } else if (daysDifference < -61) {
        referralDate = 'tra qualche mese';
    }

    return <>[{referralDate}]</>;
}

export default FormatDate;