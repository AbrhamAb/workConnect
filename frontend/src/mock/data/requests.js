// src/mock/data/requests.js

export const requests = [
  {
    id: "req-1",

    customerId: "cust-1",
    workerId: "worker-1",

    title: "Install Ceiling Lights",
    description:
      "I recently renovated my living room and need three ceiling lights installed. The wiring is already in place, but I need a professional electrician to safely install and test everything.",

    location: "Bole, Addis Ababa",

    preferredDate: "2026-07-20",
    preferredTime: "10:00 AM",

    budget: 2500,

    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],

    status: "pending",

    createdAt: "2026-07-15T09:30:00Z",
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
  },

  {
    id: "req-2",

    customerId: "cust-2",
    workerId: "worker-2",

    title: "Fix Kitchen Sink Leak",
    description:
      "The pipe under my kitchen sink has been leaking for the past two days. I'd like someone to inspect it and replace any damaged fittings if necessary.",

    location: "Hayk Dar, Hawassa",

    preferredDate: "2026-07-18",
    preferredTime: "02:00 PM",

    budget: 1800,

    images: [],

    status: "accepted",

    createdAt: "2026-07-13T11:20:00Z",
    acceptedAt: "2026-07-13T02:15:00Z",
    startedAt: null,
    completedAt: null,
  },

  {
    id: "req-3",

    customerId: "cust-1",
    workerId: "worker-2",

    title: "Bathroom Pipe Replacement",
    description:
      "The old water pipe in my bathroom needs to be replaced. The current one has rusted and occasionally leaks.",

    location: "Addis Ababa",

    preferredDate: "2026-07-10",
    preferredTime: "09:00 AM",

    budget: 3200,

    images: [
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
    ],

    status: "in_progress",

    createdAt: "2026-07-08T08:45:00Z",
    acceptedAt: "2026-07-08T11:00:00Z",
    startedAt: "2026-07-10T09:15:00Z",
    completedAt: null,
  },

  {
    id: "req-4",

    customerId: "cust-2",
    workerId: "worker-1",

    title: "Replace Faulty Wall Socket",
    description:
      "One of the wall sockets in my bedroom stopped working. I'd like it inspected and replaced if necessary.",

    location: "Bahir Dar",

    preferredDate: "2026-07-05",
    preferredTime: "01:30 PM",

    budget: 1200,

    images: [],

    status: "completed",

    createdAt: "2026-07-02T10:15:00Z",
    acceptedAt: "2026-07-02T03:40:00Z",
    startedAt: "2026-07-05T01:45:00Z",
    completedAt: "2026-07-05T03:20:00Z",
  },

  {
    id: "req-5",

    customerId: "cust-1",
    workerId: "worker-1",

    title: "Outdoor Security Light Installation",
    description:
      "Need an electrician to install two outdoor security lights near the entrance and parking area.",

    location: "Lebu, Addis Ababa",

    preferredDate: "2026-06-28",
    preferredTime: "11:00 AM",

    budget: 2800,

    images: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800",
    ],

    status: "completed",

    createdAt: "2026-06-24T04:10:00Z",
    acceptedAt: "2026-06-24T05:30:00Z",
    startedAt: "2026-06-28T11:10:00Z",
    completedAt: "2026-06-28T01:45:00Z",
  },
];
