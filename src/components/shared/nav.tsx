import React from 'react';
import { FaHome,  FaUser,  FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const navigateToPage = (page: string) => {
        navigate(page);
    }
    const navItems: NavItem[] = [
        { label: 'Home', icon: <FaHome />, onClick: () => navigateToPage('/dashboard') },
        { label: 'Orders', icon: <FaHistory />, onClick: () => navigateToPage('/orders') },
        { label: 'Profile', icon: <FaUser />, onClick: () => navigateToPage('/profile') },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#2b2b2b] shadow-md rounded-t-2xl border-t border-gray-200">
            <ul className="flex justify-around items-center py-2">
                {navItems.map((item, index) => (
                    <li
                        key={index}
                        className="flex flex-col items-center text-[#00bfff] hover:text-blue-500 cursor-pointer"
                        onClick={item.onClick}
                    >
                        <div className="text-xl">{item.icon}</div>
                        <span className="text-xs text-white">{item.label}</span>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default BottomNav;