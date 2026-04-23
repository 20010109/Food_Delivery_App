import riderAvatar from "../../assets/dodongjanjan.jpg";

export const MOCK_CONVERSATIONS = [
    {
        id: "conv-1",
        orderId: "ORD-1042",
        rider: {
            id: "rider-1",
            name: "John Lorenz Cruz",
            vehicle: "Honda Click FireBlade 1000cc",
            avatar: riderAvatar,
        },
        storeName: "Burger King",
        status: "On the way",
        eta: "12 mins",
        unreadCount: 2,
        messages: [
            {
                id: "m-1",
                sender: "rider",
                text: "Hi! I'm on my way to pick up your order.",
                timestamp: "10:14 AM",
            },
            {
                id: "m-2",
                sender: "customer",
                text: "Pabilin lang kos gawas nigga, salamat!",
                timestamp: "10:15 AM",
            },
            {
                id: "m-3",
                sender: "rider",
                text: "Sige boss.",
                timestamp: "10:18 AM",
            },
            {
                id: "m-4",
                sender: "rider",
                text: "Traffic man boss, akoa na gikaon ang order",
                timestamp: "10:30 AM",
            },
        ],
    },
];