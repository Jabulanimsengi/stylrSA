import { initBotId } from 'botid/client/core';

// Define the paths that need bot protection
// These are sensitive endpoints that should be protected from bots
initBotId({
  protect: [
    // Auth endpoints
    {
      path: '/api/auth/login',
      method: 'POST',
    },
    {
      path: '/api/auth/register',
      method: 'POST',
    },
    // Salon creation/modification
    {
      path: '/api/salons',
      method: 'POST',
    },
    {
      path: '/api/salons/*',
      method: 'PUT',
    },
    {
      path: '/api/salons/*',
      method: 'PATCH',
    },
    // Booking endpoints
    {
      path: '/api/bookings',
      method: 'POST',
    },
    {
      path: '/api/bookings/*',
      method: 'PUT',
    },
    // Reviews
    {
      path: '/api/reviews',
      method: 'POST',
    },
    // Contact/messaging
    {
      path: '/api/messages',
      method: 'POST',
    },
    // Service creation
    {
      path: '/api/services',
      method: 'POST',
    },
  ],
});
