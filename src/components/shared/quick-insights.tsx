import React from 'react';

const QuickInsights: React.FC = () => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const totalRevenue = 12345; // Replace with actual data
    const totalOrders = 678; // Replace with actual data

    return (
        <div style={{  fontFamily: 'Arial, sans-serif' }} className='p-5 border-b rounded-b-2xl'>
            <p style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{getGreeting()}!</p>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div
                    style={{
                        flex: 1,
                        padding: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        textAlign: 'center',
                        backgroundColor: '#2b2b2b'
                    }}
                >
                    <h3 className='text-white text-[10px]'>Total Revenue</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className='text-[#00bfff]'><span className='text-[8px]'>TZS </span>{totalRevenue}</p>
                </div>
                <div
                    style={{
                        flex: 1,
                        padding: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        textAlign: 'center',
                        backgroundColor: '#2b2b2b'
                    }}
                >
                    <h3 className='text-white text-[10px]'>Total Orders</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className='text-[#00bfff]'>{totalOrders}</p>
                </div>
            </div>
        </div>
    );
};

export default QuickInsights;