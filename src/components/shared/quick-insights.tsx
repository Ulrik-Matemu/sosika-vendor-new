import React, { useState, useEffect } from 'react';

const QuickInsights: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const vendorName = localStorage.getItem("vendorName");
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return `Good Morning ${vendorName}`;
        if (hour < 18) return `Good Afternoon ${vendorName}`;
        return `Good Evening ${vendorName}`;
    };

   

    const fetchOrders = async () => {
        const vendorId = localStorage.getItem('vendorId');
        try {
            const response = await fetch(`https://sosika-backend.onrender.com/api/orders/vendor/${vendorId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error('Unexpected data format:', data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);



    const totalRevenue =  orders
    .filter(order => order.order_status === 'completed')
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
    .toFixed(2);// Replace with actual data
    const totalOrders = orders.filter(order => order.order_status === 'completed').length; // Replace with actual data

    return (
        <div className='p-5 border-b rounded-b-2xl'>
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
                    <p className=' text-[10px] text-green-400'>completed</p>
                </div>
            </div>
        </div>
    );
};

export default QuickInsights;