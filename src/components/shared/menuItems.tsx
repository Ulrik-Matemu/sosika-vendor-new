import React, { useState } from 'react';
import { Edit, Trash2, DollarSign, Power, Eye, EyeOff } from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isAvailable: boolean;
}

interface MenuItemsProps {
    items: MenuItem[];
    onUpdate: (updatedItem: MenuItem) => void;
    onUpdatePrice: (itemId: number, newPrice: number) => void;
    onUpdateStatus: (itemId: number, newStatus: boolean) => void;
    onDelete: (itemId: number) => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ 
    items, 
    onUpdate, 
    onUpdatePrice, 
    onUpdateStatus, 
    onDelete 
}) => {
    const [showAll, setShowAll] = useState<boolean>(false);
    const [priceInputs, setPriceInputs] = useState<{ [key: number]: string }>({});
    const [expandedCategory, setExpandedCategory] = useState<string>('All');
    const [isEditingPrice, setIsEditingPrice] = useState<number | null>(null);

    // Filter items based on availability
    const availableItems = items.filter(item => item.isAvailable);
    const unavailableItems = items.filter(item => !item.isAvailable);
    const displayedItems = showAll ? items : availableItems;

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

    // Filter items by category
    const filteredItems = expandedCategory === 'All' 
        ? displayedItems 
        : displayedItems.filter(item => item.category === expandedCategory);

    const handleNameUpdate = (item: MenuItem) => {
        const updatedName = prompt('Update menu item name:', item.name);
        if (updatedName) {
            onUpdate({ ...item, name: updatedName });
        }
    };

    const handlePriceChange = (itemId: number, value: string) => {
        setPriceInputs(prev => ({ ...prev, [itemId]: value }));
    };

    const handlePriceUpdate = (itemId: number) => {
        const newPrice = parseFloat(priceInputs[itemId]);
        if (isNaN(newPrice) || newPrice <= 0) {
            alert('Please enter a valid price');
            return;
        }
        
        onUpdatePrice(itemId, newPrice);
        setPriceInputs(prev => ({ ...prev, [itemId]: '' }));
        setIsEditingPrice(null);
    };

    const handleToggleStatus = (item: MenuItem) => {
        onUpdateStatus(item.id, !item.isAvailable);
    };

    const handleDelete = (itemId: number) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            onDelete(itemId);
        }
    };

    return (
        <div className="bg-gray-50 p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
                    <p className="text-gray-600 text-sm mt-1">
                        {showAll ? 'Showing all items' : 'Showing available items only'} 
                        {expandedCategory !== 'All' ? ` in ${expandedCategory}` : ''}
                    </p>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                        {showAll ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showAll ? 'Show Available Only' : 'Show All Items'}
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setExpandedCategory(category)}
                                className={`px-3 py-1 rounded-lg transition text-sm ${
                                    expandedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu Items Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition duration-200 hover:shadow-lg border border-gray-100"
                    >
                        <div className="relative">
                            <img
                                src={item.image || "/api/placeholder/400/200"}
                                alt={item.name}
                                className="h-48 w-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        item.isAvailable
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            {item.category && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        {item.category}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                            
                            {isEditingPrice === item.id ? (
                                <div className="flex items-center mt-2 mb-3">
                                    <div className="relative flex-grow">
                                        <span className="absolute left-3 top-2 text-gray-500">TZS</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="New Price"
                                            value={priceInputs[item.id] || ''}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            className="border rounded-l-lg px-10 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={() => handlePriceUpdate(item.id)}
                                        disabled={!priceInputs[item.id]}
                                        className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700 text-sm disabled:bg-blue-300"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-lg font-bold text-gray-800">
                                        TZS {item.price.toLocaleString()}
                                    </p>
                                    <button
                                        onClick={() => setIsEditingPrice(item.id)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        <DollarSign size={16} />
                                        <span>Update</span>
                                    </button>
                                </div>
                            )}
                            
                            <div className="border-t pt-4 mt-2">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleToggleStatus(item)}
                                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition flex-1 ${
                                            item.isAvailable 
                                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                    >
                                        <Power size={16} />
                                        <span>{item.isAvailable ? 'Disable' : 'Enable'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleNameUpdate(item)}
                                        className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition text-sm flex-1"
                                    >
                                        <Edit size={16} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center justify-center gap-1 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 transition text-sm flex-1"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Empty state */}
            {filteredItems.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
                    <p className="text-gray-500 font-medium">No menu items found</p>
                    {!showAll && unavailableItems.length > 0 && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Show unavailable items
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuItems;