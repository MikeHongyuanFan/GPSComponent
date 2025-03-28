// Mock user status data
const userStatus = {
  1: {
    userId: 1,
    status: 'NOT_WORKING',
    startTime: '2025-03-28T17:00:00Z',
    endTime: null
  },
  2: {
    userId: 2,
    status: 'NOT_WORKING',
    startTime: '2025-03-28T18:00:00Z',
    endTime: null
  },
  3: {
    userId: 3,
    status: 'NOT_WORKING',
    startTime: '2025-03-28T16:45:00Z',
    endTime: null
  }
};

// Status history
const statusHistory = {
  1: [
    {
      userId: 1,
      status: 'WORKING_OFFICE',
      startTime: '2025-03-28T08:00:00Z',
      endTime: '2025-03-28T17:00:00Z'
    },
    {
      userId: 1,
      status: 'NOT_WORKING',
      startTime: '2025-03-28T17:00:00Z',
      endTime: null
    }
  ],
  2: [
    {
      userId: 2,
      status: 'WORKING_REMOTE',
      startTime: '2025-03-28T09:00:00Z',
      endTime: '2025-03-28T18:00:00Z'
    },
    {
      userId: 2,
      status: 'NOT_WORKING',
      startTime: '2025-03-28T18:00:00Z',
      endTime: null
    }
  ]
};

module.exports = {
  userStatus,
  statusHistory
};
