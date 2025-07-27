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
import type * as communityItems from "../communityItems.js";
import type * as generators_createDummyData from "../generators/createDummyData.js";
import type * as generators_createSupplier from "../generators/createSupplier.js";
import type * as groupBuys from "../groupBuys.js";
import type * as http from "../http.js";
import type * as loanRequests from "../loanRequests.js";
import type * as map from "../map.js";
import type * as messages from "../messages.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as suppliers from "../suppliers.js";
import type * as users from "../users.js";
import type * as wasteExchange from "../wasteExchange.js";

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
  communityItems: typeof communityItems;
  "generators/createDummyData": typeof generators_createDummyData;
  "generators/createSupplier": typeof generators_createSupplier;
  groupBuys: typeof groupBuys;
  http: typeof http;
  loanRequests: typeof loanRequests;
  map: typeof map;
  messages: typeof messages;
  orders: typeof orders;
  products: typeof products;
  suppliers: typeof suppliers;
  users: typeof users;
  wasteExchange: typeof wasteExchange;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
