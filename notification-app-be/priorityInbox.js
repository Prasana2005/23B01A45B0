const priorityWeight = {
    Placement: 3,
    Result: 2,
    Event: 1
};

const notifications = [
    {
        id: 1,
        title: "Google Hiring",
        type: "Placement",
        isRead: false,
        createdAt: "2026-06-25T10:00:00Z"
    },
    {
        id: 2,
        title: "Semester Results",
        type: "Result",
        isRead: false,
        createdAt: "2026-06-24T15:20:00Z"
    },
    {
        id: 3,
        title: "Coding Contest",
        type: "Event",
        isRead: false,
        createdAt: "2026-06-25T09:45:00Z"
    },
    {
        id: 4,
        title: "Microsoft Drive",
        type: "Placement",
        isRead: false,
        createdAt: "2026-06-24T18:30:00Z"
    },
    {
        id: 5,
        title: "Workshop",
        type: "Event",
        isRead: false,
        createdAt: "2026-06-23T12:10:00Z"
    },
    {
        id: 6,
        title: "Amazon Hiring",
        type: "Placement",
        isRead: false,
        createdAt: "2026-06-25T08:00:00Z"
    },
    {
        id: 7,
        title: "Internal Results",
        type: "Result",
        isRead: false,
        createdAt: "2026-06-24T11:00:00Z"
    },
    {
        id: 8,
        title: "Hackathon",
        type: "Event",
        isRead: false,
        createdAt: "2026-06-25T07:15:00Z"
    },
    {
        id: 9,
        title: "TCS Drive",
        type: "Placement",
        isRead: false,
        createdAt: "2026-06-24T20:10:00Z"
    },
    {
        id: 10,
        title: "Exam Results",
        type: "Result",
        isRead: false,
        createdAt: "2026-06-25T06:45:00Z"
    },
    {
        id: 11,
        title: "Guest Lecture",
        type: "Event",
        isRead: false,
        createdAt: "2026-06-22T10:30:00Z"
    }
];

const rankedNotifications = notifications
    .filter(notification => !notification.isRead)
    .map(notification => ({
        ...notification,
        score:
            priorityWeight[notification.type] * 10000000000000 +
            new Date(notification.createdAt).getTime()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

console.log("Top 10 Priority Notifications\n");

rankedNotifications.forEach((notification, index) => {
    console.log(
        `${index + 1}. ${notification.title} | ${notification.type} | ${notification.createdAt}`
    );
});