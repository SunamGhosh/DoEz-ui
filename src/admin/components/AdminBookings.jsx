import React, { useEffect, useState } from "react";
import { getAllBookings } from "../../apiservice/admin";
import { Loader2, Search, Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, Eye, Phone, Mail, Hash, CreditCard, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/Modal";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await getAllBookings();
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed": return "bg-emerald-50 text-emerald-600";
            case "Pending": return "bg-amber-50 text-amber-600";
            case "Cancelled": return "bg-red-50 text-red-600";
            case "Confirmed": return "bg-blue-50 text-blue-600";
            case "Ongoing": return "bg-purple-50 text-purple-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.customer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.provider_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking._id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
                    <p className="text-sm text-gray-500">Monitor and manage all service bookings</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium transition-all"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID or name..."
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                                <div className="space-y-1 min-w-[140px]">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Booking ID</div>
                                    <div className="text-sm font-mono font-bold text-gray-900">#{booking._id.slice(-6).toUpperCase()}</div>
                                    <div className={`mt-2 inline-flex px-2 hidden lg:block py-0.5 rounded-md text-[10px] font-black uppercase ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </div>
                                </div>

                                <div className="h-12 w-px bg-gray-100 hidden md:block"></div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Customer</div>
                                            <div className="text-sm font-bold text-gray-900">{booking.customer_id?.name || 'Unknown'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Location</div>
                                            <div className="text-xs font-medium text-gray-600 line-clamp-1">{booking.address || 'No address'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-12 w-px bg-gray-100 hidden lg:block"></div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Provider</div>
                                            <div className="text-sm font-bold text-gray-900">{booking.provider_id?.name || 'Searching...'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Service</div>
                                            <div className="text-xs font-bold text-gray-900">₹{booking.amount}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                                <button
                                    onClick={() => setSelectedBooking(booking)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 text-gray-700 rounded-xl transition-all font-bold text-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
                        <p className="text-gray-500">There are no bookings matching your current filters.</p>
                    </div>
                )}
            </div>
            {/* Booking Details Modal */}
            <Modal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                title="Booking Detailed Information"
                size="4xl"
            >
                {selectedBooking && (
                    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: ID, Status, and Parties */}
                            <div className="space-y-6">
                                {/* ID & Status */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</div>
                                        <div className="text-sm font-mono font-black text-gray-900 flex items-center gap-2">
                                            <Hash className="w-3.5 h-3.5 text-teal-600" />
                                            {selectedBooking._id}
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </div>
                                </div>

                                {/* Parties Section */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-2xl bg-teal-50/30 border border-teal-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold text-teal-700 uppercase tracking-tight mb-1">Customer Details</div>
                                            <div className="font-bold text-gray-900 text-sm whitespace-normal break-words">{selectedBooking.customer_id?.name}</div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-medium">
                                                <Phone className="w-3 h-3 text-teal-600" />
                                                {selectedBooking.customer_id?.phone || "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                            <Wrench className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-tight mb-1">Provider Details</div>
                                            <div className="font-bold text-gray-900 text-sm whitespace-normal break-words">{selectedBooking.provider_id?.name || "Unassigned"}</div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-medium">
                                                <Phone className="w-3 h-3 text-blue-600" />
                                                {selectedBooking.provider_id?.phone || "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden h-fit">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <MapPin className="w-24 h-24" />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                        Service Location
                                    </div>
                                    <div className="text-sm font-medium leading-relaxed relative z-10">
                                        {selectedBooking.address}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Service particulars and Pricing */}
                            <div className="space-y-6">
                                {/* Service Info Card */}
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Job Specification</div>
                                    <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-6">
                                        <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-base font-black text-gray-900">
                                                        {selectedBooking.service_id?.name || "General Service"}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {new Date(selectedBooking.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-teal-600">₹{selectedBooking.amount}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bill</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <DetailBox label="Category" value={selectedBooking.service_id?.serviceId?.name || "Home Services"} />
                                            <DetailBox label="Subcategory" value={selectedBooking.service_id?.subServiceId?.name || "N/A"} />
                                            <DetailBox label="Service Level" value={selectedBooking.service_id?.subService1Id?.name || "Standard"} />
                                            <DetailBox label="Booking Time" value={new Date(selectedBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Economic Indicators */}
                                <div className="grid grid-cols-2 gap-4 h-fit">
                                    <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Payment Status</span>
                                        </div>
                                        <div className="text-base font-black text-emerald-700">
                                            {selectedBooking.paymentStatus || 'Successful'}
                                        </div>
                                    </div>
                                    <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                                        <div className="flex items-center gap-2 mb-2 text-amber-600">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">Booking Cycle</span>
                                        </div>
                                        <div className="text-base font-black text-amber-700">
                                            {selectedBooking.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                                Dismiss Records
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const DetailBox = ({ label, value }) => (
    <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</div>
        <div className="text-sm font-bold text-gray-800">{value}</div>
    </div>
);

export default AdminBookings;
