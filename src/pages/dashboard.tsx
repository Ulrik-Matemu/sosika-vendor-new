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
                console.log("Menu item submitted:", data)
                // You can now send this to your backend via API
            }} />
            </div>
            <BottomNav />
        </>
    );
}