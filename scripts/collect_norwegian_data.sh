#!/bin/bash

# Norwegian Real Estate Data Collection
# Source: SSB (Statistics Norway) - https://www.ssb.no/

echo "=== Collecting Real Oslo Real Estate Data ==="

# SSB Real Estate Prices API
# Documentation: https://www.ssb.no/en/omssb/tjenester/web-services/

# API endpoints for Norwegian housing data
echo "Checking SSB Real Estate API..."
curl -s "https://data.ssb.no/api/v0/no/table/0602/" \
  -H "Accept: application/json" | head -50

echo -e "\n=== Property Price Index API ==="
# Property price index (quarterly data)
curl -s "https://data.ssb.no/api/v0/no/table/0602/0208/" \
  -H "Accept: application/json" | head -50

echo -e "\n=== Property Transaction Data ==="
# Property transaction data (annual data)
curl -s "https://data.ssb.no/api/v0/no/table/0602/0214/" \
  -H "Accept: application/json" | head -50