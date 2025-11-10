#!/bin/bash

echo "========================================="
echo "SEO Implementation Testing Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:5000"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_content=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "200" ]; then
        if [ -n "$expected_content" ]; then
            content=$(curl -s "$url" 2>&1)
            if echo "$content" | grep -q "$expected_content"; then
                echo -e "${GREEN}✓ PASSED${NC}"
                ((PASSED++))
            else
                echo -e "${RED}✗ FAILED${NC} (Content not found: $expected_content)"
                ((FAILED++))
            fi
        else
            echo -e "${GREEN}✓ PASSED${NC}"
            ((PASSED++))
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

echo "========================================="
echo "1. Testing Sitemap Endpoints"
echo "========================================="
echo ""

test_endpoint "Sitemap Index" "$BACKEND_URL/seo/sitemap-index" "sitemapindex"
test_endpoint "Static Sitemap" "$BACKEND_URL/seo/sitemap-static" "urlset"
test_endpoint "Salons Sitemap" "$BACKEND_URL/seo/sitemap-salons" "urlset"
test_endpoint "Services Sitemap" "$BACKEND_URL/seo/sitemap-services" "urlset"
test_endpoint "Trends Sitemap" "$BACKEND_URL/seo/sitemap-trends" "urlset"
test_endpoint "SEO Pages Sitemap" "$BACKEND_URL/seo/sitemap-seo-0" "urlset"

echo ""
echo "========================================="
echo "2. Testing Homepage Server-Side Rendering"
echo "========================================="
echo ""

echo -n "Testing homepage HTML content... "
homepage_html=$(curl -s "$FRONTEND_URL" 2>&1)

# Check for server-rendered content
if echo "$homepage_html" | grep -q "Featured Services"; then
    echo -e "${GREEN}✓ PASSED${NC} (Content is server-rendered)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC} (Content not found in HTML)"
    ((FAILED++))
fi

echo -n "Testing homepage metadata... "
if echo "$homepage_html" | grep -q "<title>.*Stylr SA.*</title>"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo -n "Testing homepage structured data... "
if echo "$homepage_html" | grep -q "application/ld+json"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "========================================="
echo "3. Testing Salon Page Dynamic Metadata"
echo "========================================="
echo ""

# Note: This requires a valid salon ID
echo -e "${YELLOW}Note: Salon page tests require a valid salon ID${NC}"
echo -e "${YELLOW}Skipping salon page tests (run manually with actual salon ID)${NC}"

echo ""
echo "========================================="
echo "4. Testing Image Alt Tags"
echo "========================================="
echo ""

echo -n "Testing hero image alt tags... "
if echo "$homepage_html" | grep -q 'alt="Professional hair styling'; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "========================================="
echo "Test Results Summary"
echo "========================================="
echo ""
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}"
    exit 1
fi
