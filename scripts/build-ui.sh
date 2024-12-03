#!/bin/bash
cd packages/jetv-ui
pnpm install
pnpm build
cd ../..
rm -rf node_modules
pnpm install 