import { useState, useEffect } from 'react';
import Header from '../components/shared/header';
import BottomNav from '../components/shared/nav';
import axios from 'axios';
import { Button } from '../components/ui/button';

interface VendorData {
    name: string;
    owner_name: string;
    college_id: string;
    geolocation: {
        lat: number;
        lng: number;
    };
}

interface UpdatedData {
    name?: string;
    ownerName?: string;
    collegeId?: string;
    password?: string;
}

const VendorProfile: React.FC = () => {
    const [, setVendor] = useState<VendorData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        collegeId: '',
        password: ''
    });
    const [message, setMessage] = useState({ text: '', color: '' });
    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        fetchVendorDetails();
    }, []);

    const fetchVendorDetails = async () => {
        try {
            const vendorId = localStorage.getItem('vendorId');
            if (!vendorId) throw new Error('Vendor ID not found');
            const API_URL = `https://sosika-backend.onrender.com/api/vendor/${vendorId}`;
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch vendor details');
            const vendorData: VendorData = await response.json();
            setVendor(vendorData);
            setFormData({
                name: vendorData.name,
                ownerName: vendorData.owner_name,
                collegeId: vendorData.college_id,
                password: ''
            });
            setIsLoading(false);
            if (vendorData.geolocation) initMap(vendorData.geolocation);
        } catch (error) {
            setIsLoading(false);
            setMessage({
                text: error instanceof Error ? error.message : 'Error loading vendor details',
                color: 'red'
            });
        }
    };

    const initMap = (geolocation: { lat: number; lng: number }) => {
        console.log('Map initialized with:', geolocation);
        // Your map logic here
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: UpdatedData = {};
        ['name', 'ownerName', 'collegeId', 'password'].forEach(field => {
            const val = formData[field as keyof typeof formData];
            if (typeof val === 'string' && val.trim() !== '') {
                updatedData[field as keyof UpdatedData] = val.trim();
            }
        });
        if (Object.keys(updatedData).length === 0) {
            setMessage({ text: 'No changes to update.', color: 'red' });
            return;
        }

        try {
            const vendorId = localStorage.getItem('vendorId');
            if (!vendorId) throw new Error('Vendor ID not found');
            const API_URL = `https://sosika-backend.onrender.com/api/vendor/${vendorId}`;
            const response = await axios.put(API_URL, updatedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = response.data;
            if (response.status >= 200 && response.status < 300) {
                setMessage({ text: 'Profile updated successfully!', color: 'green' });
            } else {
                throw new Error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setMessage({
                text: error instanceof Error ? error.message : 'Error updating profile',
                color: 'red'
            });
        }
    };



    if (isLoading) {
        return <div className="text-center text-gray-500 mt-20">Loading vendor details...</div>;
    }

    return (
        <>
            <Header title='Profile' />
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
                {/* Navigation Sidebar */}


                {/* Main Content */}
                <div className="flex-1 p-6 md:p-10">
                    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Update Vendor Profile</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-600">Vendor Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-600">Owner Name</label>
                                <input
                                    id="ownerName"
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="collegeId" className="block text-sm font-medium text-gray-600">College ID</label>
                                <input
                                    id="collegeId"
                                    type="text"
                                    value={formData.collegeId}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password (optional)</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Map container */}
                            <div className="border rounded-lg h-48 bg-gray-100 flex items-center justify-center" id="map">
                                <span className="text-gray-400">Map preview will appear here</span>
                            </div>

                            <Button disabled type="submit" className="w-full">
                                Update Profile
                            </Button>

                            {message.text && (
                                <div className={`mt-4 text-center font-semibold ${message.color === 'red' ? 'text-red-600' : 'text-green-600'}`}>
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <BottomNav />
        </>
    );
};

export default VendorProfile;
