import { useState, useEffect } from "react";
import Header from "../components/shared/header";
import BottomNav from "../components/shared/nav";
import QuickInsights from "../components/shared/quick-insights";
import { DrawerAddMenuItem } from "../components/shared/menuItemDrawer";
import MenuItems from "../components/shared/menuItems";

interface MenuItem {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isAvailable: boolean;
}

export const Dashboard = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const vendorId = localStorage.getItem('vendorId');

    useEffect(() => {
        if (!vendorId) {
            setError('Vendor ID not found. Please log in again.');
            setLoading(false);
            return;
        }

        fetchMenuItems(parseInt(vendorId, 10));
    }, [vendorId]);

    const fetchMenuItems = async (parsedVendorId: number) => {
        try {
            const response = await fetch(`https://sosika-backend.onrender.com/api/menuItems/${parsedVendorId}`);
            const data = await response.json();

            if (data.success) {
                // Convert API response to match our interface
                const formattedItems = data.menuItems.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    category: item.category || '',
                    price: item.price,
                    image: item.image_url,
                    isAvailable: item.is_available
                }));
                
                setMenuItems(formattedItems);
            } else {
                setError('Failed to fetch menu items: ' + data.message);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('An error occurred while fetching the menu items.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = (updatedItem: MenuItem) => {
        // Here you would make the API call to update the item
        // For now, just update the local state
        setMenuItems(prevItems =>
            prevItems.map(item => 
                item.id === updatedItem.id ? updatedItem : item
            )
        );
    };

    const handleUpdatePrice = async (itemId: number, newPrice: number) => {
        try {
            const response = await fetch(`https://sosika-backend.onrender.com/api/menuItems/${itemId}/price`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local state
                setMenuItems(prevItems =>
                    prevItems.map(item =>
                        item.id === itemId ? { ...item, price: newPrice } : item
                    )
                );
                alert('Price updated successfully!');
            } else {
                alert('Failed to update price: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the price.');
        }
    };

    const handleUpdateStatus = async (itemId: number, newStatus: boolean) => {
        try {
            const response = await fetch(`https://sosika-backend.onrender.com/api/menuItems/${itemId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update local state
                setMenuItems(prevItems =>
                    prevItems.map(item =>
                        item.id === itemId ? { ...item, isAvailable: newStatus } : item
                    )
                );
            } else {
                alert('Failed to update status: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the status.');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        try {
            const response = await fetch(`https://sosika-backend.onrender.com/api/menuItems/item/${itemId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove item from local state
                setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
                alert('Menu item deleted successfully!');
            } else {
                alert('Failed to delete menu item: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the menu item.');
        }
    };

    if (loading) return <div className="flex justify-center p-8">Loading menu items...</div>;
    if (error) return <div className="text-red-500 p-8">{error}</div>;

    return (
        <>
            <div className="bg-[#2b2b2b] rounded-b-2xl">
                <Header title="Sosika Vendor" />
            </div>
            <QuickInsights />
            <div className="grid justify-center p-5 rounded-b-2xl">
                <DrawerAddMenuItem onSubmit={(data) => {

                    const submittingMenu = async () => {
                        const vendorId = localStorage.getItem("vendorId");
                        try {
                            const formData = new FormData();
                            formData.append("name", data.name);
                            formData.append("description", data.description);
                            formData.append("category", data.category);
                            formData.append("price", String(data.price));
                            formData.append("vendorId", vendorId || "");
                            formData.append("is_available", String(data.is_available));
                            if (data.image) {
                                formData.append("image", data.image); // image is a File object
                            }

                            const response = await fetch("https://sosika-backend.onrender.com/api/menuItems", {
                                method: "POST",
                                body: formData, // no JSON.stringify!
                                // do NOT set Content-Type manually
                            });

                            const result = await response.json();

                            if (result.message === "Menu item added successfully") {
                                alert('Menu item added successfully!');
                            } else {
                                alert('Failed to add menu item: ' + (result.error || 'Unknown error'));
                            }
                        } catch (error) {
                            console.error('Error adding menu item:', error);
                            alert('An error occurred while adding the menu item.');
                        }
                    };


                    submittingMenu();
                }} />
                <div className="pb-20">
            <MenuItems 
                items={menuItems} 
                onUpdate={handleUpdateItem}
                onUpdatePrice={handleUpdatePrice}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteItem}
            />
            </div>
            </div>
            
            <BottomNav />
        </>
    );
}