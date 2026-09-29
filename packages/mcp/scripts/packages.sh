#!/bin/bash

echo "running packages...\n"

npx yalc remove --all
npm install @playbooks/cli@latest
