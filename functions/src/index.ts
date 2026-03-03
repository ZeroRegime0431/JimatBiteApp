/**
 * JimatBite Cloud Functions
 * 
 * This file exports all cloud functions for the JimatBite app.
 * Currently includes:
 * - updateDynamicPricing: Scheduled function that updates menu item prices
 *   based on freshness and time elapsed since preparation
 */

import { setGlobalOptions } from "firebase-functions";

// For cost control, limit concurrent function instances
setGlobalOptions({ maxInstances: 10 });

// Export dynamic pricing function
export { updateDynamicPricing } from './updateDynamicPricing';
