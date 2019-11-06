import express from 'express';
import { IExpressConfig } from './config';
declare const _default: (config: IExpressConfig) => express.RequestHandler<import("express-serve-static-core").ParamsDictionary>;
export default _default;
