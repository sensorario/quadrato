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

    return <>[{referralDate}]</>;
}

export default FormatDate;