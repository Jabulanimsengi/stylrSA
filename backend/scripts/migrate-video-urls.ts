import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateVideoUrls() {
  console.log('Starting video URL migration...');

  try {
    // Find all videos with old URL format
    const videos = await prisma.serviceVideo.findMany({
      where: {
        videoUrl: {
          contains: 'vimeo.com/',
          not: {
            contains: 'player.vimeo.com',
          },
        },
      },
    });

    console.log(`Found ${videos.length} videos to migrate`);

    let updated = 0;
    for (const video of videos) {
      // Convert URL from https://vimeo.com/{id} to https://player.vimeo.com/video/{id}
      const newUrl = `https://player.vimeo.com/video/${video.vimeoId}`;
      
      await prisma.serviceVideo.update({
        where: { id: video.id },
        data: { videoUrl: newUrl },
      });

      updated++;
      console.log(`Updated ${updated}/${videos.length}: ${video.videoUrl} -> ${newUrl}`);
    }

    console.log(`Migration completed! Updated ${updated} videos.`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateVideoUrls();
