import React from "react";
import { useTranslation } from "react-i18next";
import { STATUS_PANDA } from "../../themes/statusPanda";

type FakeReviewItem = {
    name: string;
    text: string;
}

const STARS = '⭐⭐⭐⭐⭐';

const FakeReviews = () => {
    const { t } = useTranslation();
    const items: FakeReviewItem[] = t('loginForm.fakeReviews.items', { returnObjects: true }) as unknown as FakeReviewItem[];

    return <div style={{
        maxWidth: '1000px',
        width: '90%',
        textAlign: 'center'
    }}>
        <h3 style={{ margin: '0 0 16px', color: '#333', fontSize: '16px' }}>
            {t('loginForm.fakeReviews.title')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: '12px', justifyContent: 'center' }}>
            {items.map((item) => (
                <div key={item.name} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'left',
                    display: 'flex',
                    gap: '12px',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                    flex: '1 1 260px',
                    maxWidth: '300px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <div style={{ transform: 'scale(2.2)' }}>
                            {STATUS_PANDA[2]}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{item.name}</span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 'bold',
                                color: '#fff',
                                backgroundColor: '#dc3545',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                textTransform: 'uppercase'
                            }}>
                                {t('loginForm.fakeReviews.badge')}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666', flex: 1 }}>{item.text}</p>
                        <div style={{ marginTop: '4px' }}>{STARS}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
}

export default FakeReviews
