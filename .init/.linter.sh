#!/bin/bash
cd /home/kavia/workspace/code-generation/user-dashboard-and-task-management-system-301790-301800/express_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

