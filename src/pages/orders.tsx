import React, { useEffect, useState, useCallback } from 'react';
import Header from "../components/shared/header";
import BottomNav from "../components/shared/nav";

// API base URL
const API_BASE_URL = 'https://sosika-backend.onrender.com/api';

interface OrderItem {
    menu_item_id: number;
    quantity: number;
    total_amount: number;
    name?: string;
}

interface Order {
    id: number;
    order_status: string;
    order_datetime: string;
    requested_datetime: string;
    requested_asap: boolean;
    total_amount: number;
    delivery_fee: number;
    items: OrderItem[];
}

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilterStatus, setCurrentFilterStatus] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [modalOrder, setModalOrder] = useState<Order | null>(null);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [menuItemsCache, setMenuItemsCache] = useState<Record<number, string>>({});
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    // Fetch vendor ID from localStorage
    const getVendorId = useCallback((): string | null => {
        return localStorage.getItem('vendorId');
    }, []);

    // Fetch orders based on filter status
    const fetchOrders = useCallback(async (status: string | null = null) => {
        setLoading(true);
        setError(null);

        const vendorId = getVendorId();
        if (!vendorId) {
            setError("Vendor ID not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            let endpoint = `${API_BASE_URL}/orders/vendor/${vendorId}`;
            if (status) {
                endpoint += `?status=${status}`;
            }

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Ensure data is an array
            const ordersArray = Array.isArray(data) ? data : [];

            // Sort orders by datetime descending
            const sortedOrders = ordersArray.sort((a: Order, b: Order) =>
                new Date(b.order_datetime).getTime() - new Date(a.order_datetime).getTime()
            );

            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(`Failed to load orders: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [getVendorId]);

    // Get item name from API or cache
    const getItemName = useCallback(async (menuItemId: number): Promise<string> => {
        if (menuItemsCache[menuItemId]) {
            return menuItemsCache[menuItemId];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/menuItems/item/${menuItemId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch menu item: ${response.status}`);
            }
            
            const data = await response.json();

            if (data && data.name) {
                // Update cache
                setMenuItemsCache(prev => ({
                    ...prev,
                    [menuItemId]: data.name
                }));
                return data.name;
            }
            
            return `Item #${menuItemId}`;
        } catch (error) {
            console.error("Error fetching item name:", error);
            return `Item #${menuItemId}`;
        }
    }, [menuItemsCache]);

    // Open order modal with details
    const openOrderModal = useCallback(async (orderId: number) => {
        setCurrentOrderId(orderId);
        setModalLoading(true);
        setModalOrder(null);

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
            }

            const order = await response.json();

            // Fetch item names for each order item
            const itemsWithNames = await Promise.all(
                (order.items || []).map(async (item: OrderItem) => {
                    const name = item.name || await getItemName(item.menu_item_id);
                    return { ...item, name };
                })
            );

            setModalOrder({ ...order, items: itemsWithNames });
        } catch (error) {
            console.error('Error fetching order details:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            showNotification(`Failed to load order details: ${errorMessage}`, 'error');
        } finally {
            setModalLoading(false);
        }
    }, [getItemName]);

    // Close order modal
    const closeModal = useCallback(() => {
        setCurrentOrderId(null);
        setModalOrder(null);
        setModalLoading(false);
    }, []);

    // Update order status
    const updateOrderStatus = useCallback(async (orderId: number, newStatus: string) => {
        setUpdatingOrderId(orderId);
        
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_status: newStatus })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update order status: ${response.status} ${errorText}`);
            }

            await response.json();

            // Show success notification
            showNotification(`Order #${orderId} status updated to ${formatStatus(newStatus)}`, 'success');

            // Close modal and refresh orders
            closeModal();
            await fetchOrders(currentFilterStatus);
        } catch (error) {
            console.error('Error updating order status:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            showNotification(`Failed to update order status: ${errorMessage}`, 'error');
        } finally {
            setUpdatingOrderId(null);
        }
    }, [closeModal, fetchOrders, currentFilterStatus]);

    // Show notification
    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        const notification: Notification = { id, message, type };
        
        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    // Remove notification
    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Format status string
    const formatStatus = useCallback((status: string): string => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, []);

    // Get time ago from date
    const getTimeAgo = useCallback((date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return "just now";
        
        const intervals = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 }
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
            }
        }

        return "just now";
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((status: string) => {
        const newStatus = status === 'All' ? null : status.toLowerCase().replace(' ', '_');
        setCurrentFilterStatus(newStatus);
        fetchOrders(newStatus);
    }, [fetchOrders]);

    // Get status color classes
    const getStatusClasses = useCallback((status: string): string => {
        const statusMap: Record<string, string> = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'assigned': 'bg-purple-100 text-purple-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    }, []);

    // Initial fetch and periodic refresh
    useEffect(() => {
        fetchOrders(currentFilterStatus);

        // Set up periodic refresh
        const intervalId = setInterval(() => {
            fetchOrders(currentFilterStatus);
        }, 30000); // Refresh every 30 seconds

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [fetchOrders, currentFilterStatus]);

    // Retry function for error state
    const handleRetry = useCallback(() => {
        fetchOrders(currentFilterStatus);
    }, [fetchOrders, currentFilterStatus]);

    return (
        <>
            <div className="bg-[#2b2b2b] rounded-b-2xl">
                <Header title="Sosika Vendor" />
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-50 space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg shadow-lg max-w-sm ${
                                notification.type === 'success' 
                                    ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
                                    : 'bg-red-100 border-l-4 border-red-500 text-red-700'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium">{notification.message}</p>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex overflow-x-auto bg-white py-4 rounded-b-2xl shadow-md">
                <div className="flex justify-around w-full min-w-max px-4">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Assigned', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            className={`px-4 py-2 text-sm md:text-base font-medium rounded transition whitespace-nowrap mx-1
                                ${(status === 'All' && currentFilterStatus === null) ||
                                status.toLowerCase().replace(' ', '_') === currentFilterStatus
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-700 hover:text-white hover:bg-gray-800'}`}
                            onClick={() => handleFilterChange(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">
                    <div className="flex justify-between items-center">
                        <p>{error}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-xl font-medium">No orders found</p>
                    <p className="text-center">
                        {currentFilterStatus 
                            ? `No ${formatStatus(currentFilterStatus)} orders found.`
                            : 'There are no orders at the moment.'
                        }
                    </p>
                    <button
                        onClick={handleRetry}
                        className="mt-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                    >
                        Refresh
                    </button>
                </div>
            ) : (
                <div className="p-4 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow rounded-lg p-4 text-black hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(order.order_status)}`}>
                                        {formatStatus(order.order_status)}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    <p><span className="text-gray-600">Ordered:</span> {getTimeAgo(new Date(order.order_datetime))}</p>
                                    <p><span className="text-gray-600">Items:</span> {order.items?.length || 0}</p>
                                    <p><span className="text-gray-600">Total:</span> ${Number(order.total_amount).toFixed(2)}</p>
                                    {order.requested_asap ? (
                                        <p><span className="text-gray-600">Delivery:</span> <span className="text-orange-600 font-medium">ASAP</span></p>
                                    ) : (
                                        <p><span className="text-gray-600">Requested:</span> {new Date(order.requested_datetime).toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openOrderModal(order.id)}
                                        disabled={modalLoading && currentOrderId === order.id}
                                        className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded transition flex-grow text-sm"
                                    >
                                        {modalLoading && currentOrderId === order.id ? 'Loading...' : 'View Details'}
                                    </button>
                                    {order.order_status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                                            disabled={updatingOrderId === order.id}
                                            className="bg-green-600 hover:bg-green-500 disabled:bg-green-400 text-white py-2 px-4 rounded transition flex-grow text-sm"
                                        >
                                            {updatingOrderId === order.id ? 'Accepting...' : 'Accept Order'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Order Modal */}
            {currentOrderId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Order Details</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            {modalLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : modalOrder ? (
                                <>
                                    <h3 className="text-lg font-semibold mb-2">Order #{modalOrder.id}</h3>
                                    <div className="bg-gray-50 rounded p-3 mb-4">
                                        <p className="mb-1">
                                            Status:
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(modalOrder.order_status)}`}>
                                                {formatStatus(modalOrder.order_status)}
                                            </span>
                                        </p>
                                        <p className="mb-1">Ordered on: {new Date(modalOrder.order_datetime).toLocaleString()}</p>
                                        <p>
                                            {modalOrder.requested_asap
                                                ? 'Requested ASAP'
                                                : `Requested for: ${new Date(modalOrder.requested_datetime).toLocaleString()}`}
                                        </p>
                                    </div>

                                    <h4 className="font-medium mb-2">Items:</h4>
                                    <div className="space-y-2 mb-4">
                                        {modalOrder.items?.length > 0 ? (
                                            modalOrder.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span>{item.quantity}x {item.name || `Item #${item.menu_item_id}`}</span>
                                                    <span className="font-medium">${Number(item.total_amount).toFixed(2)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No items found</p>
                                        )}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span>Delivery Fee:</span>
                                                <span>${Number(modalOrder.delivery_fee || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center font-bold mt-1">
                                                <span>Total:</span>
                                                <span>${Number(modalOrder.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons based on status */}
                                    {['pending', 'in_progress', 'assigned'].includes(modalOrder.order_status) && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {modalOrder.order_status === 'pending' && (
                                                <button
                                                    onClick={() => updateOrderStatus(modalOrder.id, 'in_progress')}
                                                    disabled={updatingOrderId === modalOrder.id}
                                                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white py-2 px-4 rounded transition flex-grow"
                                                >
                                                    {updatingOrderId === modalOrder.id ? 'Accepting...' : 'Accept Order'}
                                                </button>
                                            )}
                                            {(modalOrder.order_status === 'in_progress' || modalOrder.order_status === 'assigned') && (
                                                <button
                                                    onClick={() => updateOrderStatus(modalOrder.id, 'completed')}
                                                    disabled={updatingOrderId === modalOrder.id}
                                                    className="bg-green-600 hover:bg-green-500 disabled:bg-green-400 text-white py-2 px-4 rounded transition flex-grow"
                                                >
                                                    {updatingOrderId === modalOrder.id ? 'Completing...' : 'Complete Order'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateOrderStatus(modalOrder.id, 'cancelled')}
                                                disabled={updatingOrderId === modalOrder.id}
                                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white py-2 px-4 rounded transition flex-grow"
                                            >
                                                {updatingOrderId === modalOrder.id ? 'Cancelling...' : 'Cancel Order'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-red-500">Failed to load order details</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </>
    );
};

export default Orders;