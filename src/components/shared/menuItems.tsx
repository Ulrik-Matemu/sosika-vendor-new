import React, { useState, useMemo, useCallback } from 'react';
import { Edit, Trash2, DollarSign, Power, Eye, EyeOff } from 'lucide-react';

// Using a type alias for better readability if MenuItem is very long
type MenuItem = {
    id: number;
    name: string;
    description: string;
    category: string;
    price: number;
    image: string;
    isAvailable: boolean;
};

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
    onDelete,
}) => {
    const [showAll, setShowAll] = useState<boolean>(false);
    const [priceInputs, setPriceInputs] = useState<{ [key: number]: string }>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [editingPriceId, setEditingPriceId] = useState<number | null>(null);

    // Memoize filtered items to prevent re-calculations on every render
    const filteredAndDisplayedItems = useMemo(() => {
        const itemsToShow = showAll ? items : items.filter(item => item.isAvailable);
        return selectedCategory === 'All'
            ? itemsToShow
            : itemsToShow.filter(item => item.category === selectedCategory);
    }, [items, showAll, selectedCategory]);

    // Memoize categories
    const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.category)))], [items]);

    // Use useCallback for event handlers to prevent unnecessary re-renders of child components
    const handleNameUpdate = useCallback((item: MenuItem) => {
        const updatedName = prompt('Update menu item name:', item.name);
        if (updatedName !== null && updatedName.trim() !== '') {
            onUpdate({ ...item, name: updatedName.trim() });
        }
    }, [onUpdate]);

    const handlePriceChange = useCallback((itemId: number, value: string) => {
        setPriceInputs(prev => ({ ...prev, [itemId]: value }));
    }, []);

    const handlePriceUpdate = useCallback((itemId: number) => {
        const newPrice = parseFloat(priceInputs[itemId]);
        if (isNaN(newPrice) || newPrice <= 0) {
            alert('Please enter a valid positive price.');
            return;
        }

        onUpdatePrice(itemId, newPrice);
        setPriceInputs(prev => ({ ...prev, [itemId]: '' })); // Clear input
        setEditingPriceId(null); // Exit editing mode
    }, [priceInputs, onUpdatePrice]);

    const handleToggleStatus = useCallback((item: MenuItem) => {
        onUpdateStatus(item.id, !item.isAvailable);
    }, [onUpdateStatus]);

    const handleDelete = useCallback((itemId: number) => {
        if (window.confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
            onDelete(itemId);
        }
    }, [onDelete]);

    return (
        <div className="bg-gray-50 p-6 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Menu Management</h2>
                    <p className="text-gray-600 text-sm mt-2">
                        {showAll ? 'Displaying all menu items' : 'Displaying available items only'}
                        {selectedCategory !== 'All' ? ` in the "${selectedCategory}" category` : ''}.
                    </p>
                </div>

                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm text-sm font-medium"
                    >
                        {showAll ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showAll ? 'Show Available Only' : 'Show All Items'}
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            {categories.length > 1 && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Category:</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full transition text-sm font-medium ${
                                    selectedCategory === category
                                        ? 'bg-blue-600 text-white shadow-md'
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
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndDisplayedItems.map(item => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition duration-200 hover:shadow-lg border border-gray-100 flex flex-col"
                    >
                        <div className="relative">
                            <img
                                src={item.image || `https://via.placeholder.com/400x200?text=${encodeURIComponent(item.name)}`}
                                alt={item.name}
                                className="h-48 w-full object-cover"
                                loading='lazy'
                            />
                            <div className="absolute top-3 right-3">
                                <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        item.isAvailable
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            {item.category && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {item.category}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{item.description}</p>

                            {editingPriceId === item.id ? (
                                <div className="flex items-center mt-2 mb-3">
                                    <div className="relative flex-grow">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">TZS</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter new price"
                                            value={priceInputs[item.id] || ''}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            className="border rounded-l-lg pl-12 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                            autoFocus
                                            onBlur={() => {
                                                // If input is empty or invalid, cancel edit mode
                                                if (!priceInputs[item.id] || isNaN(parseFloat(priceInputs[item.id])) || parseFloat(priceInputs[item.id]) <= 0) {
                                                    setEditingPriceId(null);
                                                    setPriceInputs(prev => {
                                                        const newInputs = { ...prev };
                                                        delete newInputs[item.id];
                                                        return newInputs;
                                                    });
                                                }
                                            }}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handlePriceUpdate(item.id);
                                                }
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handlePriceUpdate(item.id)}
                                        disabled={!priceInputs[item.id] || isNaN(parseFloat(priceInputs[item.id])) || parseFloat(priceInputs[item.id]) <= 0}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 text-sm font-medium disabled:bg-blue-300 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xl font-bold text-gray-800">
                                        TZS {item.price.toLocaleString()}
                                    </p>
                                    <button
                                        onClick={() => setEditingPriceId(item.id)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition"
                                    >
                                        <DollarSign size={16} />
                                        <span>Change Price</span>
                                    </button>
                                </div>
                            )}

                            <div className="border-t pt-4 mt-auto"> {/* mt-auto pushes this div to the bottom */}
                                <div className="flex flex-wrap gap-2 justify-stretch">
                                    <button
                                        onClick={() => handleToggleStatus(item)}
                                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition flex-1 min-w-[100px] ${
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
                                        className="flex items-center justify-center gap-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-100 transition text-sm font-medium flex-1 min-w-[100px]"
                                    >
                                        <Edit size={16} />
                                        <span>Edit Name</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center justify-center gap-1 bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 transition text-sm font-medium flex-1 min-w-[100px]"
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
            {filteredAndDisplayedItems.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
                    <p className="text-gray-500 font-medium text-lg">No menu items found matching your criteria.</p>
                    {!showAll && items.some(item => !item.isAvailable) && (
                        <button
                            onClick={() => setShowAll(true)}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                            Show all items (including unavailable)
                        </button>
                    )}
                    {selectedCategory !== 'All' && (
                         <button
                            onClick={() => setSelectedCategory('All')}
                            className="mt-4 ml-2 text-blue-600 hover:text-blue-700 font-medium transition"
                        >
                            Clear category filter
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuItems;