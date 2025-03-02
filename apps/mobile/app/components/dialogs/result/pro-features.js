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

import React from "react";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { eSendEvent } from "../../../services/event-manager";
import { useThemeStore } from "../../../stores/use-theme-store";
import {
  eCloseProgressDialog,
  eCloseResultDialog,
  eOpenPremiumDialog
} from "../../../utils/events";
import { SIZE } from "../../../utils/size";
import { sleep } from "../../../utils/time";
import Paragraph from "../../ui/typography/paragraph";
export const ProFeatures = ({ count = 6 }) => {
  const colors = useThemeStore((state) => state.colors);

  return (
    <>
      {[
        {
          content:
            "Unlock unlimited notebooks, tags, colors. Organize like a pro"
        },
        {
          content:
            "Attach files upto 500MB, upload 4K images with unlimited storage"
        },
        {
          content: "Instantly sync to unlimited devices"
        },
        {
          content: "A private vault to keep everything imporant always locked"
        },
        {
          content:
            "Rich note editing experience with markdown, tables, checklists and more"
        },
        {
          content: "Export your notes in Pdf, markdown and html formats"
        }
      ]
        .slice(0, count)
        .map((item) => (
          <View
            key={item.content}
            style={{
              flexDirection: "row",
              width: "100%",
              height: 40,
              paddingHorizontal: 0,
              marginBottom: 10,
              alignItems: "center",
              borderRadius: 5,
              justifyContent: "flex-start"
            }}
          >
            <Icon size={SIZE.lg} color={colors.accent} name="check" />
            <Paragraph style={{ marginLeft: 5, flexShrink: 1 }}>
              {item.content}
            </Paragraph>
          </View>
        ))}
      <Paragraph
        onPress={async () => {
          eSendEvent(eCloseResultDialog);
          eSendEvent(eCloseProgressDialog);
          await sleep(300);
          eSendEvent(eOpenPremiumDialog);
        }}
        size={SIZE.xs + 1}
        style={{
          textDecorationLine: "underline",
          color: colors.icon
        }}
      >
        See all features included in Notesnook Pro
      </Paragraph>
    </>
  );
};
