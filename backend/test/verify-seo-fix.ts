
import { SeoPagesController } from '../src/seo/seo-pages.controller';

// Mock dependencies
const mockPrisma = {
    seoKeyword: {
        findUnique: jest.fn(),
    },
    seoLocation: {
        findFirst: jest.fn(),
    },
    seoPageCache: {
        findFirst: jest.fn(),
    },
};

const mockPageGenerator = {
    generatePageData: jest.fn().mockResolvedValue({ some: 'data' }),
};

const mockKeywordService = {};
const mockLocationService = {};

async function runTest() {
    console.log('Starting verification test...');

    const controller = new SeoPagesController(
        mockPrisma as any,
        mockPageGenerator as any,
        mockKeywordService as any,
        mockLocationService as any,
    );

    // Test Case 1: 3-part URL with SUBURB
    const url = '/best-hair/western-cape/hout-bay';
    console.log(`Testing URL: ${url}`);

    // Mock keyword found
    mockPrisma.seoKeyword.findUnique.mockResolvedValue({ slug: 'best-hair' });

    // Mock location found (SUBURB)
    // This is the critical part: findFirst will be called with the expanded type filter
    mockPrisma.seoLocation.findFirst.mockImplementation((args) => {
        console.log('findFirst called with:', JSON.stringify(args, null, 2));

        // Check if the type filter includes SUBURB
        const types = args.where.type.in;
        if (types && types.includes('SUBURB') && args.where.slug === 'hout-bay') {
            return Promise.resolve({ id: '1', name: 'Hout Bay', type: 'SUBURB', slug: 'hout-bay' });
        }
        return Promise.resolve(null);
    });

    try {
        await controller.getPageByUrl(url);
        console.log('SUCCESS: Controller accepted 3-part URL for SUBURB.');
    } catch (error) {
        console.error('FAILURE: Controller rejected 3-part URL for SUBURB.');
        console.error(error);
        process.exit(1);
    }

    // Test Case 2: 3-part URL with TOWNSHIP
    const url2 = '/best-hair/western-cape/khayelitsha';
    console.log(`\nTesting URL: ${url2}`);

    mockPrisma.seoLocation.findFirst.mockImplementation((args) => {
        const types = args.where.type.in;
        if (types && types.includes('TOWNSHIP') && args.where.slug === 'khayelitsha') {
            return Promise.resolve({ id: '2', name: 'Khayelitsha', type: 'TOWNSHIP', slug: 'khayelitsha' });
        }
        return Promise.resolve(null);
    });

    try {
        await controller.getPageByUrl(url2);
        console.log('SUCCESS: Controller accepted 3-part URL for TOWNSHIP.');
    } catch (error) {
        console.error('FAILURE: Controller rejected 3-part URL for TOWNSHIP.');
        console.error(error);
        process.exit(1);
    }
}

// Mock jest.fn if not running in jest environment
if (typeof jest === 'undefined') {
    (global as any).jest = {
        fn: () => {
            const mock: any = (...args: any[]) => {
                return mock.mockImplementation ? mock.mockImplementation(...args) : undefined;
            };
            mock.mockResolvedValue = (val: any) => {
                mock.mockImplementation = () => Promise.resolve(val);
                return mock;
            };
            mock.mockImplementation = (impl: any) => {
                mock.mockImplementation = impl;
                return mock;
            };
            return mock;
        },
    };
}

runTest().catch(e => console.error(e));
