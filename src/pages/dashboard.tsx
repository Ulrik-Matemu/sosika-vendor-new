import Header from "../components/shared/header";
import BottomNav from "../components/shared/nav";
import QuickInsights from "../components/shared/quick-insights";
import { DrawerAddMenuItem } from "../components/shared/menuItemDrawer";

export const Dashboard = () => {
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

            </div>
            <BottomNav />
        </>
    );
}