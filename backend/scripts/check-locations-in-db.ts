#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLocations() {
  console.log('Checking locations in database...\n');

  try {
    // Get total counts
    const totalLocations = await prisma.seoLocation.count();
    const provinces = await prisma.seoLocation.count({ where: { type: 'PROVINCE' } });
    const cities = await prisma.seoLocation.count({ where: { type: { in: ['CITY', 'TOWN'] } } });
    const suburbs = await prisma.seoLocation.count({ where: { type: { in: ['SUBURB', 'TOWNSHIP'] } } });

    console.log('=== Location Summary ===');
    console.log(`Total locations: ${totalLocations}`);
    console.log(`Provinces: ${provinces}`);
    console.log(`Cities/Towns: ${cities}`);
    console.log(`Suburbs/Townships: ${suburbs}\n`);

    // Show all provinces
    console.log('=== All Provinces ===');
    const allProvinces = await prisma.seoLocation.findMany({
      where: { type: 'PROVINCE' },
      orderBy: { name: 'asc' },
    });
    allProvinces.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (slug: ${p.slug})`);
    });

    // Show Gauteng cities
    console.log('\n=== Gauteng Cities ===');
    const gautengCities = await prisma.seoLocation.findMany({
      where: {
        provinceSlug: 'gauteng',
        type: { in: ['CITY', 'TOWN'] },
      },
      orderBy: { name: 'asc' },
    });
    gautengCities.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (slug: ${c.slug})`);
    });

    // Show Johannesburg suburbs
    console.log('\n=== Johannesburg Suburbs ===');
    const jhbSuburbs = await prisma.seoLocation.findMany({
      where: {
        provinceSlug: 'gauteng',
        type: { in: ['SUBURB', 'TOWNSHIP'] },
      },
      orderBy: { name: 'asc' },
      take: 20,
    });
    
    if (jhbSuburbs.length === 0) {
      console.log('No suburbs found in database');
    } else {
      jhbSuburbs.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (slug: ${s.slug})`);
      });
      if (jhbSuburbs.length === 20) {
        console.log('... (showing first 20)');
      }
    }

    // Show Western Cape cities
    console.log('\n=== Western Cape Cities ===');
    const wcCities = await prisma.seoLocation.findMany({
      where: {
        provinceSlug: 'western-cape',
        type: { in: ['CITY', 'TOWN'] },
      },
      orderBy: { name: 'asc' },
    });
    wcCities.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (slug: ${c.slug})`);
    });

    // Show KZN cities
    console.log('\n=== KwaZulu-Natal Cities ===');
    const kznCities = await prisma.seoLocation.findMany({
      where: {
        provinceSlug: 'kwazulu-natal',
        type: { in: ['CITY', 'TOWN'] },
      },
      orderBy: { name: 'asc' },
    });
    kznCities.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (slug: ${c.slug})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocations();
