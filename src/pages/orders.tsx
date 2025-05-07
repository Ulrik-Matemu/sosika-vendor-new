import React, { useEffect, useState } from 'react';
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

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFilterStatus, setCurrentFilterStatus] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [modalOrder, setModalOrder] = useState<Order | null>(null);
    const [menuItemsCache, setMenuItemsCache] = useState<Record<number, string>>({});

    // Fetch vendor ID from localStorage
    const getVendorId = (): string | null => {
        return localStorage.getItem('vendorId');
    };

    // Fetch orders based on filter status
    const fetchOrders = async (status: string | null = null) => {
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
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }

            const data = await response.json();

            // Sort orders by datetime descending
            const sortedOrders = data.sort((a: Order, b: Order) =>
                new Date(b.order_datetime).getTime() - new Date(a.order_datetime).getTime()
            );

            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(`Failed to load orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Get item name from API or cache
    const getItemName = async (menuItemId: number): Promise<string> => {
        if (menuItemsCache[menuItemId]) {
            return menuItemsCache[menuItemId];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/menuItems/item/${menuItemId}`);
            const data = await response.json();

            // Update cache
            setMenuItemsCache(prev => ({
                ...prev,
                [menuItemId]: data.name
            }));

            return data.name;
        } catch (error) {
            console.error("Error fetching item name:", error);
            return `Item #${menuItemId}`;
        }
    };

    // Open order modal with details
    const openOrderModal = async (orderId: number) => {
        setCurrentOrderId(orderId);

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.status}`);
            }

            const order = await response.json();

            // Fetch item names for each order item
            const itemsWithNames = await Promise.all(order.items.map(async (item: OrderItem) => {
                const name = item.name || await getItemName(item.menu_item_id);
                return { ...item, name };
            }));

            setModalOrder({ ...order, items: itemsWithNames });
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError(`Failed to load order details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Close order modal
    const closeModal = () => {
        setCurrentOrderId(null);
        setModalOrder(null);
    };

    // Update order status
    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ order_status: newStatus })
            });

            if (!response.ok) {
                throw new Error(`Failed to update order status: ${response.status}`);
            }

            await response.json();

            // Show notification (implement this as needed)
            showNotification(`Order #${orderId} status updated to ${formatStatus(newStatus)}`);

            // Close modal and refresh orders
            closeModal();
            fetchOrders(currentFilterStatus);
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    };

    // Show notification
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        // Implement your notification system here
        // Could use a toast library or a custom component
        console.log(`${type.toUpperCase()}: ${message}`);
        // Example: toast.success(message) or toast.error(message)
    };

    // Format status string
    const formatStatus = (status: string): string => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Get time ago from date
    const getTimeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + " years ago";

        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + " months ago";

        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + " days ago";

        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + " hours ago";

        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + " minutes ago";

        return "just now";
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchOrders();

        // Set up periodic refresh
        const intervalId = setInterval(() => {
            fetchOrders(currentFilterStatus);
        }, 20000); // Refresh every 20 seconds

        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, [currentFilterStatus]);

    // Handle filter change
    const handleFilterChange = (status: string) => {
        const newStatus = status === 'All' ? null : status.toLowerCase();
        setCurrentFilterStatus(newStatus);
        fetchOrders(newStatus);
    };

    return (
        <>
            <div className="bg-[#2b2b2b] rounded-b-2xl">
                <Header title="Sosika Vendor" />
            </div>

            {/* Filter tabs */}
            <div className="flex overflow-x-auto bg-white py-4 rounded-b-2xl shadow-md">
                <div className="flex justify-around w-full">
                    {['All', 'Pending', 'In Progress', 'Completed', 'Assigned', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            className={`px-4 py-2 text-sm md:text-base font-medium rounded transition whitespace-nowrap
                ${(status === 'All' && currentFilterStatus === null) ||
                                    status.toLowerCase() === currentFilterStatus
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
                    <p>{error}</p>
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
                    <p>There are no orders matching your criteria.</p>
                </div>
            ) : (
                <div className="p-4 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow rounded-lg p-4 text-black hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium
                    ${order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.order_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                        {formatStatus(order.order_status)}
                                    </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                    <p><span className="text-gray-600">Ordered:</span> {getTimeAgo(new Date(order.order_datetime))}</p>
                                    <p><span className="text-gray-600">Total:</span> ${order.total_amount}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openOrderModal(order.id)}
                                        className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition flex-grow text-sm"
                                    >
                                        View Details
                                    </button>
                                    {order.order_status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'in_progress')}
                                            className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition flex-grow text-sm"
                                        >
                                            Accept Order
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
                            {!modalOrder ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold mb-2">Order #{modalOrder.id}</h3>
                                    <div className="bg-gray-50 rounded p-3 mb-4">
                                        <p className="mb-1">
                                            Status:
                                            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium
                        ${modalOrder.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    modalOrder.order_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        modalOrder.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'}`}>
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
                                        {modalOrder.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span>{item.quantity}x {item.name || `Item #${item.menu_item_id}`}</span>
                                                <span className="font-medium">${item.total_amount}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between items-center">
                                                <span>Delivery Fee:</span>
                                                <span>${modalOrder.delivery_fee}</span>
                                            </div>
                                            <div className="flex justify-between items-center font-bold mt-1">
                                                <span>Total:</span>
                                                <span>${modalOrder.total_amount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons based on status */}
                                    {['pending', 'in_progress'].includes(modalOrder.order_status) && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {modalOrder.order_status === 'pending' && (
                                                <button
                                                    onClick={() => updateOrderStatus(modalOrder.id, 'in_progress')}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition flex-grow"
                                                >
                                                    Accept Order
                                                </button>
                                            )}
                                            {modalOrder.order_status === 'in_progress' && (
                                                <button
                                                    onClick={() => updateOrderStatus(modalOrder.id, 'completed')}
                                                    className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded transition flex-grow"
                                                >
                                                    Complete Order
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateOrderStatus(modalOrder.id, 'cancelled')}
                                                className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded transition flex-grow"
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </>
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