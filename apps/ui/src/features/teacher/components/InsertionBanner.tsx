import { SessionListItem } from '@server/entities/frontend';
import { daysRemaining } from '../../../utils/date.utils';

interface InsertionBannerProps {
    session: SessionListItem;
    insertOpen: boolean;
    examLimitReached: boolean;
}

export function InsertionBanner({ session, insertOpen, examLimitReached }: InsertionBannerProps) {
    return (
        <div
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border mb-[22px] ${
                insertOpen && examLimitReached
                    ? 'bg-gold-soft border-[#e7d79b]'
                    : insertOpen
                    ? 'bg-teal-soft border-[#b8d0cb]'
                    : 'bg-paper border-line'
            }`}
        >
            <span
                className={`font-mono text-[10.5px] uppercase tracking-wider px-2 py-[3px] rounded-full ${
                    insertOpen && examLimitReached
                        ? 'bg-gold text-paper'
                        : insertOpen
                        ? 'bg-teal text-paper'
                        : 'bg-ink text-paper'
                }`}
            >
                {insertOpen && examLimitReached ? 'Limite' : insertOpen ? 'Aperta' : 'Chiusa'}
            </span>
            <div className="flex-1 text-sm">
                {insertOpen && examLimitReached ? (
                    <>
                        <b className="text-ink">Limite di {session.examLimit} appelli raggiunto.</b>
                        <span className="text-ink-2">
                            {' '}Puoi modificare o cancellare gli appelli esistenti, ma non aggiungerne altri.
                        </span>
                    </>
                ) : insertOpen ? (
                    <>
                        <b className="text-ink">Finestra di inserimento attiva.</b>
                        <span className="text-ink-2">
                            {' '}Puoi inserire, modificare o cancellare i tuoi appelli fino al{' '}
                            {new Date(session.endInsertDate).toLocaleDateString('it-IT', {
                                day: 'numeric', month: 'long', year: 'numeric',
                            })}.
                        </span>
                    </>
                ) : (
                    <>
                        <b className="text-ink">Finestra di inserimento non attiva.</b>
                        <span className="text-ink-2">
                            {' '}Periodo previsto:{' '}
                            {new Date(session.startInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}
                            {' → '}
                            {new Date(session.endInsertDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}.
                        </span>
                    </>
                )}
            </div>
            {insertOpen && !examLimitReached && (
                <span className="font-mono text-[11px] text-ink-3">
                    Restano {daysRemaining(session.endInsertDate)} giorni
                </span>
            )}
        </div>
    );
}
