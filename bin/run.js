#!/usr/bin/env node
/* eslint-disable notice/notice */
import oclif from '@oclif/core';

await oclif.execute({ type: 'esm', dir: import.meta.url });
