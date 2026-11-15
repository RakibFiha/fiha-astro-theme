#!/usr/bin/env bash
# In a real site the theme sits at theme/; here the example lives inside the theme.
cd "$(dirname "$0")/.." && exec ../scripts/check-dist.sh "$@"
