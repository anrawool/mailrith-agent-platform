#!/usr/bin/env node

import { runMailrithCli } from "./index.js";

process.exitCode = await runMailrithCli(process.argv.slice(2));
