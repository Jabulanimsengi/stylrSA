# 👨‍💼 Admin User Management - Implementation Guide

## What We'll Add

Admin endpoints to:
1. ✅ View all users
2. ✅ Filter by verification status
3. ✅ See user details
4. ✅ View unverified users
5. ✅ Enhanced salon views with owner verification status

## 📝 Code to Add

### 1. Update `admin.service.ts`

Add these methods to `/backend/src/admin/admin.service.ts`:

```typescript
// Add after existing methods

/**
 * Get all users with optional verification filter
 */
async getAllUsers(emailVerified?: boolean) {
  const where = emailVerified !== undefined ? { emailVerified } : {};
  
  return this.prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
      _count: {
        select: {
          salons: true,
          products: true,
          bookings: true,
          reviews: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 500, // Limit to prevent huge responses
  });
}

/**
 * Get detailed user information
 */
async getUserDetails(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      failedLoginAttempts: true,
      accountLockedUntil: true,
      verificationExpires: true,
      salons: {
        select: {
          id: true,
          name: true,
          approvalStatus: true,
          createdAt: true,
        }
      },
      products: {
        select: {
          id: true,
          name: true,
          approvalStatus: true,
          createdAt: true,
        }
      },
      bookings: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Get only unverified users
 */
async getUnverifiedUsers() {
  return this.getAllUsers(false);
}

/**
 * Enhanced getAllSalons with owner verification status
 */
async getAllSalonsWithOwnerInfo() {
  return this.prisma.salon.findMany({
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
        }
      },
      _count: {
        select: {
          services: true,
          bookings: true,
          reviews: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Delete unverified accounts older than specified days
 */
async cleanupUnverifiedAccounts(daysOld: number = 7) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  const result = await this.prisma.user.deleteMany({
    where: {
      emailVerified: false,
      createdAt: {
        lt: cutoffDate
      }
    }
  });

  // Log the action
  console.log(`[ADMIN] Cleaned up ${result.count} unverified accounts older than ${daysOld} days`);
  
  return {
    message: `Deleted ${result.count} unverified accounts`,
    count: result.count,
    olderThan: `${daysOld} days`
  };
}

/**
 * Get user statistics for admin metrics
 */
async getUserStats() {
  const [
    totalUsers,
    verifiedUsers,
    unverifiedUsers,
    usersLast7Days,
    usersLast30Days,
    salonOwners,
    productSellers,
    clients,
  ] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.user.count({ where: { emailVerified: true } }),
    this.prisma.user.count({ where: { emailVerified: false } }),
    this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    this.prisma.user.count({ where: { role: 'SALON_OWNER' } }),
    this.prisma.user.count({ where: { role: 'PRODUCT_SELLER' } }),
    this.prisma.user.count({ where: { role: 'CLIENT' } }),
  ]);

  return {
    total: totalUsers,
    verified: verifiedUsers,
    unverified: unverifiedUsers,
    verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) + '%' : '0%',
    newLast7Days: usersLast7Days,
    newLast30Days: usersLast30Days,
    byRole: {
      salonOwners,
      productSellers,
      clients,
    }
  };
}
```

### 2. Update `admin.controller.ts`

Add these routes to `/backend/src/admin/admin.controller.ts`:

```typescript
// Add these new endpoints to the controller

@Get('users/all')
getAllUsers(@Query('verified') verified?: string) {
  const emailVerified = 
    verified === 'true' ? true : 
    verified === 'false' ? false : 
    undefined;
  return this.adminService.getAllUsers(emailVerified);
}

@Get('users/unverified')
getUnverifiedUsers() {
  return this.adminService.getUnverifiedUsers();
}

@Get('users/stats')
getUserStats() {
  return this.adminService.getUserStats();
}

@Get('users/:userId')
getUserDetails(@Param('userId') userId: string) {
  return this.adminService.getUserDetails(userId);
}

@Get('salons/with-owners')
getAllSalonsWithOwnerInfo() {
  return this.adminService.getAllSalonsWithOwnerInfo();
}

@Post('users/cleanup-unverified')
cleanupUnverifiedAccounts(@Body('daysOld') daysOld?: number) {
  return this.adminService.cleanupUnverifiedAccounts(daysOld || 7);
}
```

### 3. Update Metrics Endpoint

Enhance your existing `getMetrics()` method in `admin.service.ts`:

```typescript
async getMetrics() {
  const [
    // ... existing metrics ...
    userStats,
  ] = await Promise.all([
    // ... existing Promise.all items ...
    this.getUserStats(),
  ]);

  return {
    // ... existing metrics ...
    users: userStats,
  };
}
```

## 🧪 Testing the New Endpoints

### Get All Users
```bash
GET http://localhost:3000/api/admin/users/all
Authorization: Bearer <admin-token>
```

Response:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SALON_OWNER",
    "emailVerified": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "lastLoginAt": "2025-01-20T15:30:00Z",
    "_count": {
      "salons": 1,
      "products": 0,
      "bookings": 5,
      "reviews": 3
    }
  }
]
```

### Get Only Unverified Users
```bash
GET http://localhost:3000/api/admin/users/all?verified=false
# or
GET http://localhost:3000/api/admin/users/unverified
```

### Get User Details
```bash
GET http://localhost:3000/api/admin/users/{userId}
```

### Get User Statistics
```bash
GET http://localhost:3000/api/admin/users/stats
```

Response:
```json
{
  "total": 150,
  "verified": 142,
  "unverified": 8,
  "verificationRate": "94.7%",
  "newLast7Days": 12,
  "newLast30Days": 45,
  "byRole": {
    "salonOwners": 35,
    "productSellers": 20,
    "clients": 95
  }
}
```

### Cleanup Old Unverified Accounts
```bash
POST http://localhost:3000/api/admin/users/cleanup-unverified
Content-Type: application/json

{
  "daysOld": 7
}
```

### Get Salons with Owner Info
```bash
GET http://localhost:3000/api/admin/salons/with-owners
```

Response:
```json
[
  {
    "id": "salon-uuid",
    "name": "Beautiful Hair Salon",
    "approvalStatus": "PENDING",
    "owner": {
      "id": "user-uuid",
      "email": "owner@example.com",
      "firstName": "Jane",
      "emailVerified": true,
      "createdAt": "2025-01-10T08:00:00Z",
      "lastLoginAt": "2025-01-20T14:22:00Z"
    },
    "_count": {
      "services": 5,
      "bookings": 23,
      "reviews": 12
    }
  }
]
```

## 🎨 Frontend Admin Dashboard Ideas

### User Management Page

```typescript
// Example React component structure
function UserManagementPage() {
  const [filter, setFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  
  return (
    <div>
      <h1>User Management</h1>
      
      {/* Stats Cards */}
      <StatsRow>
        <StatCard title="Total Users" value={stats.total} />
        <StatCard title="Verified" value={stats.verified} />
        <StatCard title="Unverified" value={stats.unverified} />
        <StatCard title="Verification Rate" value={stats.verificationRate} />
      </StatsRow>
      
      {/* Filter Tabs */}
      <Tabs>
        <Tab onClick={() => setFilter('all')}>All Users</Tab>
        <Tab onClick={() => setFilter('verified')}>Verified</Tab>
        <Tab onClick={() => setFilter('unverified')}>Unverified ⚠️</Tab>
      </Tabs>
      
      {/* User Table */}
      <UserTable filter={filter}>
        {users.map(user => (
          <UserRow key={user.id}>
            <td>{user.email}</td>
            <td>{user.firstName} {user.lastName}</td>
            <td>{user.role}</td>
            <td>
              {user.emailVerified ? (
                <Badge color="green">✅ Verified</Badge>
              ) : (
                <Badge color="red">❌ Unverified</Badge>
              )}
            </td>
            <td>{formatDate(user.createdAt)}</td>
            <td>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
            <td>
              <Button onClick={() => viewUser(user.id)}>View</Button>
            </td>
          </UserRow>
        ))}
      </UserTable>
    </div>
  );
}
```

### Enhanced Salon Approval View

```typescript
function SalonApprovalPage() {
  return (
    <div>
      <h1>Pending Salons</h1>
      
      {salons.map(salon => (
        <SalonCard key={salon.id}>
          <SalonInfo>
            <h3>{salon.name}</h3>
            <p>{salon.description}</p>
          </SalonInfo>
          
          <OwnerInfo>
            <h4>Owner Information</h4>
            <p>Email: {salon.owner.email}</p>
            <p>Name: {salon.owner.firstName} {salon.owner.lastName}</p>
            <p>
              Email Status: 
              {salon.owner.emailVerified ? (
                <Badge color="green">✅ Verified</Badge>
              ) : (
                <Badge color="red">❌ Unverified (Suspicious!)</Badge>
              )}
            </p>
            <p>Account Age: {calculateAge(salon.owner.createdAt)}</p>
            <p>Last Login: {formatDate(salon.owner.lastLoginAt)}</p>
          </OwnerInfo>
          
          <Actions>
            <Button color="green" onClick={() => approve(salon.id)}>
              Approve
            </Button>
            <Button color="red" onClick={() => reject(salon.id)}>
              Reject
            </Button>
          </Actions>
        </SalonCard>
      ))}
    </div>
  );
}
```

## 📊 Benefits

### For Admin:
1. ✅ **See all users at a glance**
2. ✅ **Identify unverified accounts**
3. ✅ **Monitor verification rate**
4. ✅ **See owner verification when approving salons**
5. ✅ **Clean up old unverified accounts**
6. ✅ **Get comprehensive user statistics**

### Security Benefits:
1. ✅ **Spot suspicious patterns** (e.g., unverified user creating salon = impossible, but admin can check)
2. ✅ **Monitor system health** (low verification rate = email issues?)
3. ✅ **Reduce database bloat** (auto-cleanup old unverified accounts)

## ⚠️ Important Notes

1. **These endpoints are admin-only** - Protected by `@Roles('ADMIN')` decorator
2. **Unverified users still can't log in** - This just gives visibility
3. **Cleanup is optional** - You decide if/when to run it
4. **Take backups** - Before running cleanup in production

## 🚀 Implementation Steps

1. ✅ Add methods to `admin.service.ts`
2. ✅ Add routes to `admin.controller.ts`
3. ✅ Test endpoints with Postman/cURL
4. ✅ Build frontend admin pages
5. ✅ Add to admin navigation
6. ✅ Deploy and monitor

---

**Ready to implement?** Just copy the code into your files, restart backend, and test!
