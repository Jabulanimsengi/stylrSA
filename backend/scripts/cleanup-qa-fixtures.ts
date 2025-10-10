import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const QA_EMAILS = [
  'qa.client.20251010a@example.com',
  'qa.owner.20251010a@example.com',
  'qa.admin.20251010a@example.com',
  'qa.seller.20251010a@example.com',
];

async function main() {
  const qaUsers = await prisma.user.findMany({
    where: { email: { in: QA_EMAILS } },
  });

  if (qaUsers.length === 0) {
    console.log('No QA users found. Nothing to clean up.');
    return;
  }

  const qaUserIds = qaUsers.map((user) => user.id);

  const salons = await prisma.salon.findMany({
    where: { ownerId: { in: qaUserIds } },
  });
  const salonIds = salons.map((salon) => salon.id);

  const services = await prisma.service.findMany({
    where: { salonId: { in: salonIds } },
  });
  const serviceIds = services.map((service) => service.id);

  const products = await prisma.product.findMany({
    where: { sellerId: { in: qaUserIds } },
  });
  const productIds = products.map((product) => product.id);

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: { in: qaUserIds } }, { user2Id: { in: qaUserIds } }],
    },
  });
  const conversationIds = conversations.map((conversation) => conversation.id);

  await prisma.notification.deleteMany({
    where: { userId: { in: qaUserIds } },
  });

  if (conversationIds.length > 0) {
    await prisma.message.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });
  }

  await prisma.review.deleteMany({
    where: {
      OR: [
        { userId: { in: qaUserIds } },
        { salonId: { in: salonIds } },
      ],
    },
  });

  await prisma.booking.deleteMany({
    where: {
      OR: [{ userId: { in: qaUserIds } }, { salonId: { in: salonIds } }],
    },
  });

  const favoriteConditions: { userId?: { in: string[] }; salonId?: { in: string[] } }[] = [
    { userId: { in: qaUserIds } },
  ];
  if (salonIds.length > 0) {
    favoriteConditions.push({ salonId: { in: salonIds } });
  }

  await prisma.favorite.deleteMany({
    where: {
      OR: favoriteConditions,
    },
  });

  const serviceLikeConditions: { userId?: { in: string[] }; serviceId?: { in: string[] } }[] = [
    { userId: { in: qaUserIds } },
  ];
  if (serviceIds.length > 0) {
    serviceLikeConditions.push({ serviceId: { in: serviceIds } });
  }

  await prisma.serviceLike.deleteMany({
    where: {
      OR: serviceLikeConditions,
    },
  });

  if (conversationIds.length > 0) {
    await prisma.conversation.deleteMany({
      where: { id: { in: conversationIds } },
    });
  }

  if (productIds.length > 0) {
    await prisma.productOrder.deleteMany({
      where: {
        OR: [
          { buyerId: { in: qaUserIds } },
          { sellerId: { in: qaUserIds } },
          { productId: { in: productIds } },
        ],
      },
    });

    await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });
  }

  if (serviceIds.length > 0) {
    await prisma.service.deleteMany({
      where: { id: { in: serviceIds } },
    });
  }

  if (salonIds.length > 0) {
    await prisma.galleryImage.deleteMany({
      where: { salonId: { in: salonIds } },
    });

    await prisma.salon.deleteMany({
      where: { id: { in: salonIds } },
    });
  }

  await prisma.user.deleteMany({
    where: { id: { in: qaUserIds } },
  });

  console.log('QA fixtures removed successfully.');
}

main()
  .catch((error) => {
    console.error('Failed to clean QA fixtures', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


