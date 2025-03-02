/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Plan, PricingInfo } from "./types";
import create from "zustand";
import produce from "immer";

interface ICheckoutStore {
  selectedPlan?: Plan;
  onPlanSelected: (plan?: Plan) => void;
  pricingInfo?: PricingInfo;
  onPriceUpdated: (pricingInfo?: PricingInfo) => void;
  isApplyingCoupon: boolean;
  setIsApplyingCoupon: (isApplyingCoupon: boolean) => void;
  couponCode?: string;
  onApplyCoupon: (couponCode?: string) => void;
  reset: () => void;
}
export const useCheckoutStore = create<ICheckoutStore>((set) => ({
  selectedPlan: undefined,
  pricingInfo: undefined,
  couponCode: undefined,
  isApplyingCoupon: false,
  onPlanSelected: (plan) =>
    set(
      produce((state: ICheckoutStore) => {
        state.selectedPlan = plan;
        state.pricingInfo = undefined;
      })
    ),
  onPriceUpdated: (pricingInfo) =>
    set(
      produce((state: ICheckoutStore) => {
        state.pricingInfo = pricingInfo;
      })
    ),
  onApplyCoupon: (couponCode) =>
    set(
      produce((state: ICheckoutStore) => {
        console.log("SETTING coupon", couponCode);
        state.couponCode = couponCode;
      })
    ),
  setIsApplyingCoupon: (isApplyingCoupon) =>
    set(
      produce((state: ICheckoutStore) => {
        state.isApplyingCoupon = isApplyingCoupon;
      })
    ),
  reset: () => {
    set(
      produce((state: ICheckoutStore) => {
        state.selectedPlan = undefined;
        state.pricingInfo = undefined;
        state.couponCode = undefined;
        state.isApplyingCoupon = false;
      })
    );
  }
}));
