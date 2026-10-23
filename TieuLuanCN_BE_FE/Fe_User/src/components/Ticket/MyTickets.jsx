import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Ticket,
    Calendar,
    Clock,
    MapPin,
    Film,
    User,
    Armchair,
    ShoppingBag,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    ChevronDown,
    Popcorn,
    CreditCard
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const MyTickets = ({ user, setUser }) => {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            console.log('📤 Fetching tickets.. .');
            const response = await axios.get(
                'http://localhost:8080/api/tickets/my-tickets',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Tickets response:', response.data);
            setTickets(response.data);
            setError(null);

        } catch (error) {
            console.error("❌ Lỗi khi lấy vé:", error);

            if (error.response?.status === 401) {
                alert("Phiên đăng nhập đã hết hạn.  Vui lòng đăng nhập lại.");
                navigate('/login');
            } else {
                setError(error.response?.data?.message || "Không thể tải danh sách vé");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        setUser(null);
        window.location.href = "/login";
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString?.substring(0, 5);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            PAID: {
                icon: CheckCircle,
                text: 'Đã thanh toán',
                bgColor: 'bg-green-500/20',
                borderColor: 'border-green-400',
                textColor: 'text-green-300'
            },
            PENDING: {
                icon: Clock,
                text: 'Chờ thanh toán',
                bgColor: 'bg-yellow-500/20',
                borderColor: 'border-yellow-400',
                textColor: 'text-yellow-300'
            },
            CANCELLED: {
                icon: XCircle,
                text: 'Đã hủy',
                bgColor: 'bg-red-500/20',
                borderColor: 'border-red-400',
                textColor: 'text-red-300'
            },
            USED: {
                icon: AlertCircle,
                text: 'Đã sử dụng',
                bgColor: 'bg-gray-500/20',
                borderColor: 'border-gray-400',
                textColor: 'text-gray-300'
            }
        };

        const config = statusConfig[status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                <Icon className={`w-4 h-4 ${config.textColor}`} />
                <span className={`text-sm font-semibold ${config.textColor}`}>
                    {config.text}
                </span>
            </div>
        );
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === "ALL" || ticket.status === filterStatus;
        const matchesSearch = ticket.showtime?.movie?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.seat?.seatNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const groupTicketsByDate = (tickets) => {
        const grouped = {};
        tickets.forEach(ticket => {
            const date = ticket.bookingDate || 'Unknown';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(ticket);
        });
        return grouped;
    };

    const groupedTickets = groupTicketsByDate(filteredTickets);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
                <Header user={user} handleLogout={handleLogout} />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                        <div className="text-white/80 text-lg">Đang tải danh sách vé...</div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
            <Header user={user} handleLogout={handleLogout} />

            <main className="flex-1 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Ticket className="w-8 h-8" />
                                    VÉ CỦA TÔI
                                </h1>
                                <p className="text-white/60 mt-1">
                                    Quản lý tất cả vé xem phim của bạn
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-sm">Tổng số vé</div>
                                <div className="text-3xl font-bold text-yellow-300">
                                    {tickets.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 mb-6 border border-white/20">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên phim hoặc số ghế..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                                />
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                                >
                                    <Filter className="w-5 h-5" />
                                    <span>
                                        {filterStatus === "ALL" ? "Tất cả" :
                                            filterStatus === "PAID" ? "Đã thanh toán" :
                                                filterStatus === "PENDING" ? "Chờ thanh toán" :
                                                    filterStatus === "CANCELLED" ? "Đã hủy" : "Đã sử dụng"}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showFilterMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/20 rounded-lg shadow-xl z-10">
                                        {["ALL", "PAID", "PENDING", "CANCELLED", "USED"].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setFilterStatus(status);
                                                    setShowFilterMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-all ${filterStatus === status ? 'bg-white/5 text-yellow-300' : 'text-white'
                                                    }`}
                                            >
                                                {status === "ALL" ? `Tất cả (${tickets.length})` :
                                                    status === "PAID" ? `Đã thanh toán (${tickets.filter(t => t.status === 'PAID').length})` :
                                                        status === "PENDING" ? `Chờ thanh toán (${tickets.filter(t => t.status === 'PENDING').length})` :
                                                            status === "CANCELLED" ? `Đã hủy (${tickets.filter(t => t.status === 'CANCELLED').length})` :
                                                                `Đã sử dụng (${tickets.filter(t => t.status === 'USED').length})`}

                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-400 rounded-xl p-6 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                            <div>
                                <div className="text-white font-semibold">Có lỗi xảy ra</div>
                                <div className="text-red-300 text-sm">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredTickets.length === 0 && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-12 border border-white/20 text-center">
                            <Ticket className="w-20 h-20 text-white/30 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {searchTerm || filterStatus !== "ALL"
                                    ? "Không tìm thấy vé nào"
                                    : "Bạn chưa có vé nào"}
                            </h2>
                            <p className="text-white/60 mb-6">
                                {searchTerm || filterStatus !== "ALL"
                                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                    : "Hãy đặt vé xem phim để bắt đầu trải nghiệm! "}
                            </p>
                            {!searchTerm && filterStatus === "ALL" && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold"
                                >
                                    Đặt Vé Ngay
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tickets List */}
                    {Object.entries(groupedTickets).map(([date, dateTickets]) => (
                        <div key={date} className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-5 h-5 text-yellow-300" />
                                <h2 className="text-xl font-bold text-white">
                                    {formatDate(date)}
                                </h2>
                                <span className="text-white/60 text-sm">
                                    ({dateTickets.length} vé)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {dateTickets.map(ticket => (
                                    <div
                                        key={ticket.ticketID}
                                        className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden hover:scale-[1.02] transition-all"
                                    >
                                        <div className="flex">
                                            {/* Movie Poster */}
                                            <div className="w-32 flex-shrink-0">
                                                {ticket.showtime?.movie?.imageUrl ? (
                                                    <img
                                                        src={ticket.showtime.movie.imageUrl}
                                                        alt={ticket.showtime.movie.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <Film className="w-12 h-12 text-white/50" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ticket Details */}
                                            <div className="flex-1 p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-white font-bold text-lg mb-1">
                                                            {ticket.showtime?.movie?.title}
                                                        </h3>
                                                        {getStatusBadge(ticket.status)}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                                        <Clock className="w-4 h-4" />
                                                        <span>
                                                            {formatTime(ticket.showtime?.startTime)} - {formatTime(ticket.showtime?.endTime)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{ticket.room?.roomName}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-white/80 text-sm">
                                                        <Armchair className="w-4 h-4" />
                                                        <span>Ghế: {ticket.seat?.seatNumber}</span>
                                                    </div>
                                                </div>

                                                {/* Combos */}
                                                {ticket.combos && ticket.combos.length > 0 && (
                                                    <div className="border-t border-white/10 pt-3 mb-3">
                                                        <div className="flex items-center gap-2 text-yellow-300 text-sm font-semibold mb-2">
                                                            <Popcorn className="w-4 h-4" />
                                                            <span>Combo đã chọn:</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {ticket.combos.map((combo, index) => (
                                                                <div key={index} className="text-white/70 text-xs pl-6">
                                                                    • {combo.nameCombo} - {formatCurrency(combo.price)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Price */}
                                                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                                                    <span className="text-white/60 text-sm">Tổng tiền:</span>
                                                    <span className="text-yellow-300 font-bold text-xl">
                                                        {formatCurrency(ticket.price)}
                                                    </span>
                                                </div>

                                                {/* Ticket ID */}
                                                <div className="mt-2 text-white/40 text-xs">
                                                    Mã vé: #{ticket.ticketID}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Statistics */}
                    {tickets.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-green-500/20 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-green-400/30">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-10 h-10 text-green-400" />
                                    <div>
                                        <div className="text-white/60 text-sm">Đã thanh toán</div>
                                        <div className="text-2xl font-bold text-white">
                                            {tickets.filter(t => t.status === 'PAID').length}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-500/20 backdrop-blur-md rounded-xl shadow-2xl p-6 border border-red-400/30">
                                <div className="flex items-center gap-3">
                                    <XCircle className="w-10 h-10 text-red-400" />
                                    <div>
                                        <div className="text-white/60 text-sm">Đã hủy</div>
                                        <div className="text-2xl font-bold text-white">
                                            {tickets.filter(t => t.status === 'CANCELLED').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyTickets;