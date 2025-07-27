/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as generators_createSupplier from "../generators/createSupplier.js";
import type * as http from "../http.js";
import type * as loanRequests from "../loanRequests.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as suppliers from "../suppliers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  "generators/createSupplier": typeof generators_createSupplier;
  http: typeof http;
  loanRequests: typeof loanRequests;
  orders: typeof orders;
  products: typeof products;
  suppliers: typeof suppliers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
